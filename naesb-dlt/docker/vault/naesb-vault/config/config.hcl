storage "consul" {
  address = "consul:8500"
  path = "vault"
  service = "vault"
  scheme = "http"
  service_address = "192.168.55.11"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = true
}
ui = true
disable_mlock = true

seal "awskms" {
  kms_key_id = "03d4dd01-43c8-41ee-95b7-8618875e6170"
  region = "us-east-1"
}