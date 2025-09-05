variable "profile" {
  type    = string
  default = "naesb"
}

variable "owner" {
  type = string
}

variable "app" {
  type = string
}

variable "environment" {
  type    = string
  default = "dev"
}


variable "cluster_tag_key" {
  type = string
}

variable "cluster_tag_value" {
  type = string
}

variable "family" {
  description = "Task definition family (https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#family). The lower-cased family name is used by default as the Consul service name if `consul_service_name` is not provided."
  type        = string
}

variable "port" {
  type = string
}

variable "consul_service_name" {
  description = "The name the service will be registered as in Consul. Defaults to the Task family name."
  type        = string
  default     = ""

  validation {
    error_message = "The consul_service_name must be lower case. It must match the regex, '^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$'."
    condition     = var.consul_service_name == "" || can(regex("^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$", var.consul_service_name))
  }
}

variable "requires_compatibilities" {
  description = "Set of launch types required by the task."
  type        = list(string)
  default     = ["EC2", "FARGATE"]
}

variable "log_configuration" {
  description = "Task definition log configuration object (https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_LogConfiguration.html)."
  type        = any
  default     = {}
}

variable "cpu" {
  description = "Number of cpu units used by the task."
  type        = number
  default     = 256
}

variable "consul_datacenter" {
  description = "Datacenter to connect to."
  type        = string
  default     = "dc1"
}

variable "memory" {
  description = "Amount (in MiB) of memory used by the task."
  type        = number
  default     = 512
}

variable "volumes" {
  description = "List of volumes to include in the aws_ecs_task_definition resource."
  type        = any
  default     = []
}

variable "container_definitions" {
  description = "Application container definitions (https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definitions)."
  # This is `any` on purpose. Using `list(any)` is too restrictive. It requires maps in the list to have the same key set, and same value types.
  type = any
}

variable "iam_role_path" {
  description = "The path where IAM roles will be created."
  type        = string
  default     = "/consul-ecs/"

  validation {
    error_message = "The iam_role_path must begin with '/'."
    condition     = var.iam_role_path != "" && substr(var.iam_role_path, 0, 1) == "/"
  }
}

variable "additional_task_role_policies" {
  description = "List of additional policy ARNs to attach to the task role."
  type        = list(string)
  default     = []
}

variable "additional_execution_role_policies" {
  description = "List of additional policy ARNs to attach to the execution role."
  type        = list(string)
  default     = []
}

variable "consul_server_ca_cert_arn" {
  description = "The ARN of the Secrets Manager secret containing the Consul server CA certificate for Consul's internal RPC."
  type        = string
}

variable "gossip_key_secret_arn" {
  description = "The ARN of the Secrets Manager secret containing the Consul gossip encryption key."
  type        = string
}

variable "tags" {
  description = "A map of tags to add to all resources."
  type        = map(string)
  default     = {}
}

variable "application_shutdown_delay_seconds" {
  type        = number
  description = <<-EOT
  An optional number of seconds by which to delay application shutdown. By default, there is no delay. This delay allows
  incoming traffic to drain off before your application container exits. This delays the TERM signal from ECS when
  the task is stopped. However, the KILL signal from ECS cannot be delayed, so this value should be shorter than the
  `stopTimeout` on the container definition. This works by setting an explicit `entryPoint` field on each container without an
  `entryPoint` field. Containers with a non-null `entryPoint` field will be ignored. Since this sets an explicit entrypoint,
  the default entrypoint from the image (if present) will not be used, so you may need to set the `command` field on the
  container definition to ensure your container starts properly, depending on your image.
  EOT
  default     = 0
}

variable "checks" {
  description = <<-EOT
  A list of maps defining Consul checks for this service. This follows the schema of the `service.checks` field
  of the consul-ecs config file (https://github.com/hashicorp/consul-ecs/blob/main/config/schema.json). See
  the Consul checks documentation (https://www.consul.io/docs/discovery/checks) for more.
  EOT

  type    = any
  default = []

  validation {
    error_message = "Check fields must be one of 'checkId', 'name', 'args', 'items', 'interval', 'timeout', 'ttl', 'http', 'header', 'method', 'body', 'tcp', 'status', 'notes', 'tlsServerName', 'tlsSkipVerify', 'grpc', 'grpcUseTls', 'h2ping', 'h2pingUseTls', 'aliasNode', 'aliasService', 'successBeforePassing', or 'failuresBeforeCritical'."
    condition = alltrue(flatten([
      for check in var.checks : [
        for key in keys(check) : contains(
          [
            "checkId",
            "name",
            "args",
            "items",
            "interval",
            "timeout",
            "ttl",
            "http",
            "header",
            "method",
            "body",
            "tcp",
            "status",
            "notes",
            "tlsServerName",
            "tlsSkipVerify",
            "grpc",
            "grpcUseTls",
            "h2ping",
            "h2pingUseTls",
            "aliasNode",
            "aliasService",
            "successBeforePassing",
            "failuresBeforeCritical",
          ],
          key
        )
      ]
    ]))
  }
}

variable "acls" {
  description = "Whether to enable ACLs for the mesh task."
  type        = bool
  default     = false
}
