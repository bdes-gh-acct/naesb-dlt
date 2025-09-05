# Getting Started with NAESB DLT

This repository holds the smart contracts, APIs, UI, and deployment scripts for the NAESB DLT network. The APIs and UI are built using NodeJS and React respectively. The Smart Contracts are built using TypeScript. The deployment scripts are created using Terraform.

## Pre-Reqs

Install the following programs

- Git
- Nodejs v14
- Docker
- AWS CLI
- Terraform
- Packer

## Folder Structure

With the exception of the smart contracts, the nodejs and react portions of this repo are structured using a [Lerna](https://github.com/lerna/lerna) monorepository. Each folder in the packages folder is designed as a seperate NPM package. All devDependencies should be installed at the root of the project.

### **AMI**

This folder holds Hashicorp Packer templates for creating the base AMIs for the Consul, Vault, and other server instances. The vault template is loosely based on [this example](https://github.com/hashicorp/terraform-aws-vault/tree/master/examples/vault-consul-ami). The consul AMI is based on [this example](https://github.com/hashicorp/terraform-aws-consul/tree/master/examples/consul-ami). These AMIs are design to work with the hashicorp reference deployment for Vault and Consul respectively. The AMIs include private and public keys for the server instances. These keys are generated using the consul CLI. Moving forward, these keys should be generated and stored in AWS Secret Store and loaded during instance startup. Note that these keys will have to be recreated occasionally as the certificates are set to expire in 2023.

### **Contracts**

This folder holds the chaincode for the application. Each folder within contracts is a seperate chaincode. Currently, the only chaincode that is getting installed is the trade chaincode.

### **Deploy**

This folder holds the terraform scripts used to deploy the application. This consists of six modules, which must be deployed in sequence. The directions for deploying the terraform scripts are found below in the deployment section. The modules are described as follows:

- Consul: Creates the consul cluster and vault cluster.
- DB: Creates the DB (RDS Postgres Aurora Server) and a migration lambda function. The terraform also invokes to migration lambda to run the migrations
- Ledger: Creates the CAs for each organization. Also creates the peer nodes
- Orderer: Creates the orderer node and admin service for the network
- Ledger-Service: Creates the ledger APIs for each organization. Also creates the price, tsp, and core service

### **Packages**

The packages folder contains the different components

- **api-admin**: NAESB administrative functionality. Will be responsible for managing and initiating delivery data workflows.
- **api-core**: Surface API exposed to the client. Will be responsible for receiving ledger requests
- **api-ledger-admin**: API for interacting with the orderer and peer nodes to create channels and install smart contracts
- **api-ledger-id**: API for interacting with vault to generate the PKI certificates
- **api-ledger**: API for interacting with the peer nodes. Includes the gateway information
- **api-price**: API for dealing with Price Index data
- **api-tsp**: API for dealing with TSP data including TSP IDs and Locations
- **client**: Main React UI for operating ledger
- **client-tsp**: React UI for TSP information
- **react-toolkit**: React shared components for building various UIs
- **model**: shared typescript types
- **server-utils**: shared backend functions and utils

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install -g lerna
$ npm install
```

## Setup

Before running the application, you must build the relevant docker images. The main services have an npm script in the associated package.json that builds the docker image. These scripts can be run from anywhere in the repo using the lerna command as follows:

```bash
$ lerna run build:docker --scope @api/ledger
$ lerna run build:docker --scope @api/ledger-id
$ lerna run build:docker --scope @api/ledger-admin
$ lerna run build:docker --scope @api/core
$ lerna run build:docker --scope @api/price
$ lerna run build:docker --scope @api/tsp
```

## Running the app

The backend services for the local environment can be run using docker-compose by running the following command from the root of the repo:

```bash
$ npm run docker:up
```

The UI can be run by using the following lerna command from anywhere in the repo. Note: The client will be listening on http://localhost:3000

```bash
$ lerna run start --scope client
```

## Rebuilding the app

Because the backend is running using docker images, and not in daemon mode, live reload is not enabled. To rebuild you must bring down the stack, rebuild the necessary image(s) and start up. In order to bring down the stack you can run the following command from the root of the repo:

```bash
$ npm run docker:down
```
