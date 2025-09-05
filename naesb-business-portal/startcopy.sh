#!/bin/bash

 curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"MzEPfpHEoi2yC2U/2yvt0SZOB49y3NxY"'", "role":"'"ENDORSER"'", "alias":"'"Reece Test"'"}' -X POST https://indy.dev.naesbdlt.org/api/register 