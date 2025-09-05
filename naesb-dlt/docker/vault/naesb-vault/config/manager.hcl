path "/secret/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
}

path "sys/mounts/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# List enabled secrets engine
path "sys/mounts" {
  capabilities = [ "read", "list" ]
}

# Work with pki secrets engine
path "*/root" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo" ]
}

# Work with pki roles
path "*/roles" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo" ]
}