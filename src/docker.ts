import { Docker } from "node-docker-api";

export const docker = new Docker({ socketPath: process.env.DOCKER_SOCK || '/var/run/docker.sock' });