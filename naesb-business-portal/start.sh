#!/bin/bash

  # DID is bootstrapped to network assuming that the POOL_URL/register endpoint is supported and is unauthenticated
curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"bw7kLcQ+L80tq8lwk+QosmbyHawwyvx8"'", "role":"'"STEWARD"'", "alias":"'"NAESB"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 

sleep 15

curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"ggLvjdtGngQkSuDBmqVyNl7lNe7yTm1g"'", "role":"'"ENDORSER"'", "alias":"'"SWN"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 

sleep 15

curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"77zStCIpojgAHqhfLQhOy31qRmJLRpCl"'", "role":"'"ENDORSER"'", "alias":"'"TVA"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 

sleep 15

 curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"bN5L2/ryUX715MK0M88iZyF+m+/JcAje"'", "role":"'"ENDORSER"'", "alias":"'"Project Canary"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 
 
sleep 15

 curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"wn7N5NSPzSS09nAi8atVKNcMQBMjuRxQ"'", "role":"'"ENDORSER"'", "alias":"'"MiQ"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 

sleep 15

 curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"AOfrk/NdnKhDWmoW4vpcegRX16rV7OHl"'", "role":"'"ENDORSER"'", "alias":"'"Equitable Origin"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 

 sleep 15

 curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"MzEPfpHEoi2yC2U/2yvt0SZOB49y3NxY"'", "role":"'"ENDORSER"'", "alias":"'"EQT"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 
