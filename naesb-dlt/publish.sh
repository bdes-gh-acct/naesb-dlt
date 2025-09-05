#!/bin/bash

repository_endpoint= aws codeartifact get-repository-endpoint --domain naesb --domain-owner 094458522773 --repository naesb --format npm
echo $repository_endpoint

