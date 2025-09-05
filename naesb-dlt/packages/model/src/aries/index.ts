export interface IConnection {
  accept: string;
  alias: string;
  connection_id: string;
  connection_protocol: string;
  created_at: string;
  error_msg?: string;
  inbound_connection_id: string;
  invitation_key: string;
  invitation_mode: string;
  invitation_msg_id: string;
  my_did: string;
  request_id: string;
  rfc23_state: string;
  routing_state: string;
  state: string;
  their_did: string;
  their_label: string;
  their_public_did: string;
  their_role: string;
  updated_at: string;
}
