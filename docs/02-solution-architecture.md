---
title: Solution Architecture
project: Balan Coffee & Roastery
version: 2.0
authors:
  - AWS Cloud Club Workshop Team
date: 2026-08
status: Final
---

# Solution Architecture

---

# Table of Contents

1. Purpose
2. Architecture Principles
3. Solution Overview
4. High-Level Architecture
5. System Components
6. Request Flow
7. Data Flow
8. AWS Services
9. Network Architecture
10. Security Architecture
11. Monitoring & Observability
12. Design Decisions
13. Future Enhancements

---

# 1. Purpose

This document describes the technical architecture of the AWS-modernized Balan Coffee & Roastery platform. It provides an overview of the system components, cloud infrastructure, service interactions, and architectural decisions that support the deployment of the application on Amazon Web Services (AWS).

---

# 2. Architecture Principles

The solution is designed according to the following principles:

- Cloud-native architecture
- Managed services where applicable
- Separation of application and infrastructure
- Secure-by-default configuration
- Observability-first operations
- Modular and maintainable design
- Containerized deployment

---

# 3. Solution Overview

The application is deployed on an Amazon EC2 instance using Docker Compose. Amazon CloudFront acts as the content delivery layer for incoming client requests.

The backend communicates with AWS managed services including Amazon RDS, Amazon S3, Amazon Bedrock, Amazon Cognito, Amazon SES, and AWS Secrets Manager.

Operational visibility is provided through Amazon CloudWatch and the CloudWatch Agent running on the EC2 instance.

---

# 4. High-Level Architecture

> Insert `architecture.png`
![AWS Modernized Architecture](./architecture.png)

**Figure 1.** AWS Modernized Architecture for Balan Coffee & Roastery.

---

# 5. System Components

## Client Layer

- Web Browser
- HTTP Requests

Responsibilities

- Access web application
- Submit user requests
- Display application interface

---

## Content Delivery Layer

### Amazon CloudFront

Responsibilities

- Global content delivery
- HTTP termination
- Edge caching
- Performance optimization

---

## Compute Layer

### Amazon EC2

Responsibilities

- Host application
- Execute Docker containers
- Connect to AWS managed services

### Docker

Containers

- Frontend
- Backend

---

## Data Layer

### Amazon RDS PostgreSQL

Responsibilities

- Persistent relational database
- Application data storage
- Transaction processing

---

## Supporting AWS Services

### Amazon S3

Object storage

### Amazon Cognito

Authentication and authorization

### Amazon SES

Email delivery

### Amazon Bedrock

AI-powered chatbot and recommendations

### AWS Secrets Manager

Secure application configuration

---

## Monitoring Layer

### Amazon CloudWatch Agent

Collects

- Host metrics
- Application logs

### Amazon CloudWatch

Provides

- Metrics
- Logs
- Dashboard

---

# 6. Request Flow

## User Request

```
User
    │
HTTP
    ▼
CloudFront
    │
Internet Gateway
    ▼
EC2
    │
Frontend
    │
Backend
```

---

## Backend Processing

```
Backend
    │
    ├── Amazon RDS
    ├── Amazon S3
    ├── Amazon Cognito
    ├── Amazon SES
    ├── Amazon Bedrock
    └── AWS Secrets Manager
```

---

## Monitoring Flow

```
EC2
    │
CloudWatch Agent
    │
CloudWatch
```

Collected telemetry includes:

- Infrastructure metrics
- Application logs
- Dashboard metrics

---

# 7. Data Flow

## Authentication

```
User

↓

Frontend

↓

Backend

↓

Amazon Cognito
```

---

## Product List

```
Frontend

↓

Backend

↓

Amazon RDS
```

---

## Image Upload

```
Frontend

↓

Backend

↓

Amazon S3
```

---

## AI Recommendation

```
User

↓

Frontend

↓

Backend

↓

Amazon Bedrock

↓

AI Response
```

---

# 8. AWS Services

| AWS Service 		| Role 			|
|-----------------------|-----------------------|
| Amazon EC2 		| Compute 		|
| Docker 		| Application runtime 	|
| Amazon CloudFront 	| Content delivery 	|
| Amazon RDS 		| Database 		|
| Amazon S3 		| Object storage 	|
| Amazon Cognito 	| Authentication 	|
| Amazon SES 		| Email 		|
| Amazon Bedrock 	| AI 			|
| AWS Secrets Manager 	| Secret storage 	|
| Amazon CloudWatch 	| Monitoring 		|

---

# 9. Network Architecture

## Public Subnet

- Amazon EC2
- Internet Gateway
- Elastic IP

## Private Subnet

- Amazon RDS PostgreSQL

Security Groups restrict communication between application and database resources.

---

# 10. Security Architecture

The solution applies multiple security mechanisms.

Infrastructure

- Security Groups
- Private database subnet

Application

- Amazon Cognito
- JWT Authentication

Configuration

- AWS Secrets Manager

Transport

- HTTPS
- CloudFront

---

# 11. Monitoring & Observability

Application monitoring is implemented using Amazon CloudWatch.

Capabilities

- Infrastructure metrics
- Log collection
- Dashboard visualization

CloudWatch Agent continuously publishes telemetry from the EC2 instance.

---

# 12. Design Decisions

| Decision | Reason |
|----------|--------|
| Docker Compose | Simplified deployment for workshop |
| Amazon EC2 | Full infrastructure control |
| Amazon CloudFront | Improved performance and HTTPS |
| Amazon RDS | Managed relational database |
| Amazon CloudWatch | Centralized monitoring |
| AWS Secrets Manager | Secure configuration |
| Amazon Bedrock | AI capability integration |

---

# 13. Future Enhancements

The architecture can be extended with:

- Amazon ECS
- Application Load Balancer
- Auto Scaling Groups
- Route 53
- AWS WAF
- AWS Certificate Manager
- CI/CD Pipeline
- Infrastructure as Code (AWS CloudFormation or Terraform)

---