locals {
  owner                   = lower(terraform.workspace)
  app                     = "naesb-dlt"
  domain                  = "naesbdlt.org"
  consul_data_volume_name = "consul_data"
  consul_data_mount = {
    sourceVolume  = local.consul_data_volume_name
    containerPath = "/consul"
    readOnly      = true
  }
  task_role_id       = aws_iam_role.task.id
  execution_role_id  = aws_iam_role.execution.id
  execution_role_arn = aws_iam_role.execution.arn
  task_role_arn      = aws_iam_role.task.arn
  consul_data_mount_read_write = merge(
    local.consul_data_mount,
    { readOnly = false },
  )
  service_name = var.consul_service_name != "" ? var.consul_service_name : var.family
  container_defs_with_depends_on = [for def in var.container_definitions :
    merge(
      def,
      {
        dependsOn = flatten(
          concat(
            lookup(def, "dependsOn", []),
            [
              {
                containerName = "consul"
                condition     = "HEALTHY"
              },
            ]
        ))
      },
      {
        // Use the def.entryPoint, if defined. Else, use the app_entrypoint, which is null by default.
        entryPoint = lookup(def, "entryPoint", null)
        # mountPoints = flatten(
        #   concat(
        #     lookup(def, "mountPoints", []),
        #     local.app_mountpoints,
        #   )
        # )
      }
    )
  ]


  defaulted_check_containers = length(var.checks) == 0 ? [for def in local.container_defs_with_depends_on : def.name
  if contains(keys(def), "essential") && contains(keys(def), "healthCheck") && (try(def.healthCheck, null) != null)] : []
  // health-sync is enabled if acls are enabled, in order to run 'consul logout' to cleanup tokens when the task stops
  health_sync_enabled = length(local.defaulted_check_containers) > 0 || var.acls
}

resource "aws_ecs_task_definition" "this" {
  family                   = var.family
  requires_compatibilities = var.requires_compatibilities
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = local.execution_role_arn
  task_role_arn            = local.task_role_arn

  dynamic "volume" {
    for_each = var.volumes
    content {
      name      = volume.value["name"]
      host_path = lookup(volume.value, "host_path", null)

      dynamic "docker_volume_configuration" {
        for_each = contains(keys(volume.value), "docker_volume_configuration") ? [
          volume.value["docker_volume_configuration"]
        ] : []
        content {
          autoprovision = lookup(docker_volume_configuration.value, "autoprovision", null)
          driver_opts   = lookup(docker_volume_configuration.value, "driver_opts", null)
          driver        = lookup(docker_volume_configuration.value, "driver", null)
          labels        = lookup(docker_volume_configuration.value, "labels", null)
          scope         = lookup(docker_volume_configuration.value, "scope", null)
        }
      }

      dynamic "efs_volume_configuration" {
        for_each = contains(keys(volume.value), "efs_volume_configuration") ? [
          volume.value["efs_volume_configuration"]
        ] : []
        content {
          file_system_id          = efs_volume_configuration.value["file_system_id"]
          root_directory          = lookup(efs_volume_configuration.value, "root_directory", null)
          transit_encryption      = lookup(efs_volume_configuration.value, "transit_encryption", null)
          transit_encryption_port = lookup(efs_volume_configuration.value, "transit_encryption_port", null)
          dynamic "authorization_config" {
            for_each = contains(keys(efs_volume_configuration.value), "authorization_config") ? [
              efs_volume_configuration.value["authorization_config"]
            ] : []
            content {
              access_point_id = lookup(authorization_config.value, "access_point_id", null)
              iam             = lookup(authorization_config.value, "iam", null)
            }
          }
        }
      }

      dynamic "fsx_windows_file_server_volume_configuration" {
        for_each = contains(keys(volume.value), "fsx_windows_file_server_volume_configuration") ? [
          volume.value["fsx_windows_file_server_volume_configuration"]
        ] : []

        content {
          // All fields required.
          file_system_id = fsx_windows_file_server_volume_configuration.value["file_system_id"]
          root_directory = fsx_windows_file_server_volume_configuration.value["root_directory"]
          dynamic "authorization_config" {
            for_each = contains(keys(fsx_windows_file_server_volume_configuration.value), "authorization_config") ? [
              fsx_windows_file_server_volume_configuration.value["authorization_config"]
            ] : []
            content {
              // All fields required.
              credentials_parameter = authorization_config.value["credentials_parameter"]
              domain                = authorization_config.value["domain"]
            }
          }
        }
      }
    }
  }

  tags = merge(
    var.tags,
    {
      "consul.hashicorp.com/service-name" = local.service_name
    },
  )

  container_definitions = jsonencode(
    flatten(
      concat(
        local.container_defs_with_depends_on,
        [
          # {
          #   name      = "dns"
          #   image     = "storytel/dnsmasq"
          #   essential = true
          #   command   = "dnsmasq --no-daemon --server=/consul/127.0.0.1#8600"
          #   portMappings = [
          #     {
          #       containerPort = 9000
          #       hostPort      = 53
          #       protocol      = "udp"
          #   }]
          #   logConfiguration = var.log_configuration
          #   linuxParameters = {
          #     initProcessEnabled = true
          #     add = [
          #     "NET_ADMIN"]
          #   }
          #   cpu         = 256
          #   volumesFrom = []
          #   environment = [
          #     {
          #       name  = "CONSUL_DATACENTER"
          #       value = var.consul_datacenter
          #     }
          #   ]
          # },
          {
            name      = "consul"
            image     = "094458522773.dkr.ecr.us-east-1.amazonaws.com/naesbdlt/consul:latest"
            essential = true
            portMappings = [{
              containerPort = 8301
              hostPort      = 8301
              },
              {
                containerPort = 8302
                hostPort      = 8302
              },
              {
                containerPort = 8300
                hostPort      = 8300
              },
              {
                containerPort = 8500
                hostPort      = 8500
              },
              {
                containerPort = 53
                hostPort      = 53
              },
              {
                containerPort = 8600
                hostPort      = 8600
            }]
            logConfiguration = var.log_configuration
            linuxParameters = {
              initProcessEnabled = true
            }
            cpu         = 256
            volumesFrom = []
            environment = [
              {
                name  = "CONSUL_DATACENTER"
                value = var.consul_datacenter
              },
              {
                name  = "CLUSTER_TAG_KEY",
                value = var.cluster_tag_key
              },
              {
                name  = "CONSUL_ALLOW_PRIVILEGED_PORTS",
                value = "yes"
              },
              {
                name  = "CLUSTER_TAG_VALUE",
                value = var.cluster_tag_value
              },
            ]
            healthCheck = {
              command = [
                "CMD-SHELL",
                "curl --silent --fail localhost:8500/v1/agent/checks || exit 1",
              ]
              interval = 30
              retries  = 3
              timeout  = 5
            }
            secrets = [
              {
                name      = "CONSUL_CACERT_PEM",
                valueFrom = var.consul_server_ca_cert_arn
              },

              {
                name      = "CONSUL_GOSSIP_ENCRYPTION_KEY",
                valueFrom = var.gossip_key_secret_arn
            }]

          },
        ]
      )
    )
  )
}
