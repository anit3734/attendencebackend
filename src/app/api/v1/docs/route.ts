import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/http-status";

export const runtime = "nodejs";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "Enterprise Attendance & Workforce Management API",
      version: "1.0.0",
      description:
        "Production-ready REST API Backend built with Next.js 15, Clean Architecture, Mongoose 8, and Zod validation.",
      contact: {
        name: "Backend Engineering Team",
        email: "support@cloudshope.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local Development Server",
      },
      {
        url: "http://192.168.1.40:3000/api/v1",
        description: "Local Network / Mobile App Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Health Check API",
          description: "Returns server status and MongoDB database connectivity state.",
          responses: {
            "200": { description: "System is healthy" },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "User Authentication",
          description: "Authenticate user and issue JWT Access and Refresh Tokens.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "admin@company.com" },
                    password: { type: "string", example: "Password123!" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Login successful" },
            "401": { description: "Invalid credentials" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          summary: "Refresh Access Token",
          description: "Rotates refresh token and returns a fresh Access Token.",
          responses: {
            "200": { description: "Token refreshed" },
          },
        },
      },
      "/attendance/clock-in": {
        post: {
          summary: "GPS Geofenced Clock-In",
          description: "Records employee clock-in with Haversine GPS geofence validation.",
          responses: {
            "201": { description: "Clock-in recorded" },
            "400": { description: "Outside geofence or shift breach" },
          },
        },
      },
      "/attendance/clock-out": {
        post: {
          summary: "Clock-Out & Working Hours Engine",
          description: "Calculates total working hours and computes final day status.",
          responses: {
            "200": { description: "Clock-out recorded" },
          },
        },
      },
      "/leaves": {
        post: {
          summary: "Apply for Leave",
          description: "Submit a leave request with overlapping date validation.",
          responses: {
            "201": { description: "Leave request created" },
          },
        },
      },
      "/holidays": {
        get: {
          summary: "Get Company Holiday Calendar",
          description: "Retrieves company holidays for a given year.",
          responses: {
            "200": { description: "Holidays list" },
          },
        },
      },
      "/notifications": {
        get: {
          summary: "Get User Notifications",
          description: "Retrieves in-app notifications for the logged in user.",
          responses: {
            "200": { description: "Notifications list" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, { status: HTTP_STATUS.OK });
}
