FROM 094458522773.dkr.ecr.us-east-1.amazonaws.com/external/hyperledger/fabric-orderer:2.5
COPY ./init.sh /tmp
RUN apt update
RUN apt install -y jq curl
RUN chmod -R 0777 /tmp
CMD /tmp/init.sh