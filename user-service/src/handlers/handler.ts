import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { controller } from "../controller/controller";

export class handler {
  private controller: controller;

  constructor(ctrl: controller) {
    this.controller = ctrl;
  }
}
