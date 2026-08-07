---
title: Solution Design Document
project: Balan Coffee & Roastery
version: 2.0
authors:
  - AWS Cloud Club Workshop Team
date: 2026-08-07
status: Final
---

# Solution Design Document

> AWS Modernization of Balan Coffee & Roastery

---

# Table of Contents

1. Executive Summary
2. Business Context
3. Problem Statement
4. Project Objectives
5. Scope
6. Stakeholders
7. Solution Overview
8. High-Level Architecture
9. Technology Stack
10. AWS Services
11. Non-functional Requirements
12. Security Considerations
13. Deployment Strategy
14. Monitoring & Observability
15. Risks
16. Future Roadmap

---

# 1. Executive Summary

## Background

Balan Coffee & Roastery is an existing e-commerce web application originally developed using React, Express.js, and MongoDB.

This project modernizes the application by migrating its infrastructure and core platform services to Amazon Web Services (AWS), introducing managed cloud services to improve scalability, security, maintainability, and operational visibility.

Rather than redesigning the business application, the project focuses on cloud adoption and infrastructure modernization.

---

# 2. Business Context

## Existing Challenges

The legacy deployment model presents several operational limitations:

- Manual deployment process
- Limited scalability
- No centralized monitoring
- No content delivery optimization
- Local secret management
- Limited cloud-native integrations

These limitations reduce operational efficiency and production readiness.

---

# 3. Problem Statement

How can the existing Balan Coffee & Roastery platform be modernized using AWS managed services while preserving the application's existing business functionality?

---

# 4. Project Objectives

The project aims to:

- Modernize application infrastructure
- Improve operational scalability
- Enhance application security
- Introduce centralized monitoring
- Integrate AI capabilities
- Improve deployment consistency
- Demonstrate AWS cloud architecture best practices

---

# 5. Project Scope

## In Scope

- Amazon EC2
- Docker & Docker Compose
- Amazon RDS PostgreSQL
- Amazon CloudFront
- Amazon CloudWatch
- Amazon S3
- Amazon Cognito
- Amazon SES
- Amazon Bedrock
- AWS Secrets Manager

## Out of Scope

- CI/CD Pipeline
- Auto Scaling
- Load Balancer
- Route 53
- Infrastructure as Code
- Kubernetes / Amazon ECS
- Disaster Recovery

---

# 6. Stakeholders

| Role                      | Responsibility                |
|---------------------------|-------------------------------|
| Project Manager           | Project coordination          |
| Infrastructure Engineer   | AWS infrastructure            |
| Backend Developer         | API & database migration      |
| Frontend Developer        | UI integration                |
| AI Engineer               | Amazon Bedrock integration    |

---

# 7. Solution Overview

The solution adopts a cloud-native architecture while maintaining the existing application logic.

Key improvements include:

- Containerized deployment
- Managed PostgreSQL database
- Global content delivery
- Secure authentication
- AI-powered recommendation capability
- Centralized monitoring
- Managed secret storage

---

# 8. High-Level Architecture

> Insert Architecture Diagram here

---

# 9. Technology Stack

## Frontend

- React
- Vite

## Backend

- Express.js
- Node.js

## Database

- PostgreSQL

## Infrastructure

- Docker
- Docker Compose

---

# 10. AWS Services

| Service               | Purpose               |
|-----------------------|-----------------------|
| Amazon EC2            | Compute               |
| Amazon CloudFront     | CDN                   |
| Amazon RDS            | Database              |
| Amazon S3             | Object Storage        |
| Amazon Cognito        | Authentication        |
| Amazon SES            | Email                 |
| Amazon Bedrock        | AI                    |
| Amazon CloudWatch     | Monitoring            |
| AWS Secrets Manager   | Secret Management     |

---

# 11. Non-functional Requirements

## Availability

- Public application access
- Stable infrastructure

## Security

- IAM Role
- Secrets Manager
- Security Groups

## Performance

- CloudFront caching
- Managed database

## Maintainability

- Dockerized deployment
- Modular architecture

## Observability

- CloudWatch Metrics
- CloudWatch Logs
- CloudWatch Dashboard

---

# 12. Security Considerations

- IAM Roles for AWS service access
- Secrets stored in AWS Secrets Manager
- Private database subnet
- Security Group isolation
- HTTPS delivery through CloudFront

---

# 13. Deployment Strategy

1. Provision AWS infrastructure
2. Configure networking
3. Configure Secrets Manager
4. Deploy Docker containers
5. Configure CloudFront
6. Configure CloudWatch
7. Validate deployment

---

# 14. Monitoring & Observability

Amazon CloudWatch provides:

- Infrastructure Metrics
- Application Logs
- Monitoring Dashboard

CloudWatch Agent collects telemetry from the EC2 instance.

---

# 15. Risks

| Risk                      | Mitigation            |
|---------------------------|-----------------------|
| Database migration        | Incremental migration |
| Secret synchronization    | AWS Secrets Manager   |
| Docker deployment         | Docker Compose        |
| CloudFront cache          | Cache invalidation    |

---

# 16. Future Roadmap

Future enhancements include:

- CI/CD Pipeline
- Amazon ECS
- Auto Scaling
- Route 53
- AWS WAF
- ACM
- Multi-AZ Deployment
- Infrastructure as Code