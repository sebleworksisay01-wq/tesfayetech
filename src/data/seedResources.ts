import { Resource } from '../types';

export const SEED_RESOURCES: Resource[] = [
  {
    id: 'res-k8s-hardening',
    title: 'Kubernetes Production Zero-Trust Hardening Guide & CIS Benchmark Runbook',
    shortDescription: 'Definitive cluster hardening specification covering API server TLS, Kyverno admission controls, pod security standards, network policies, and audit log pipelines.',
    content: `## Executive Overview
This guide provides enterprise infrastructure teams with a production-grade, step-by-step methodology to achieve full compliance with CIS Kubernetes Benchmark v1.8 and implement a strict Zero-Trust network architecture.

### 1. Control Plane Hardening
Configure the kube-apiserver with the following mandatory runtime flags:
\`\`\`yaml
spec:
  containers:
  - command:
    - kube-apiserver
    - --anonymous-auth=false
    - --profiling=false
    - --tls-cipher-suites=TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    - --authorization-mode=Node,RBAC
    - --enable-admission-plugins=NodeRestriction,PodSecurity
\`\`\`

### 2. Mandatory Network Policy Isolation
All namespace deployments must default to total deny on ingress and egress:
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
\`\`\`

### 3. Kyverno Admission Validation
Enforce non-root execution across all non-system namespaces:
\`\`\`yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-run-as-non-root
spec:
  validationFailureAction: Enforce
  rules:
  - name: check-runAsNonRoot
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Running as root user is prohibited."
      pattern:
        spec:
          securityContext:
            runAsNonRoot: true
\`\`\`

### 4. Verification & Audit Scripts
Run the attached automated audit script in staging prior to production application.`,
    category: 'Security & DevOps',
    resourceType: 'manual',
    tags: ['Kubernetes', 'Security', 'CIS Benchmark', 'Zero-Trust', 'DevOps'],
    fileName: 'k8s-zero-trust-hardening-runbook-v3.pdf',
    fileType: 'PDF',
    fileSize: '3.4 MB',
    fileData: `#!/usr/bin/env bash
# Kubernetes CIS Audit Verification Script
set -euo pipefail
echo "=== Running Kubernetes CIS Compliance Checks ==="
kubectl get nodes -o wide
echo "Checking anonymous auth on API server:"
kubectl get pods -n kube-system -l component=kube-apiserver -o jsonpath='{.items[*].spec.containers[*].command}' | grep -o -- '--anonymous-auth=false' || echo "WARNING: Anonymous auth enabled"
echo "Validating Pod Security Admission standards..."
kubectl get ns --show-labels
echo "Done."
`,
    version: '3.2.0',
    author: 'Marcus Vance, CISSP / CKA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    visibility: 'members_only',
    status: 'published',
    sourceUrl: 'https://github.com/nexustech/k8s-zero-trust',
    license: 'Enterprise IT Internal Use License',
    downloadCount: 384,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'res-core-switch-dr',
    title: 'Enterprise Cisco & Juniper Core Switch Disaster Recovery Manual',
    shortDescription: 'Emergency failover procedures, out-of-band serial recovery, spanning-tree loop remediation, and dual-homed BGP routing restoration protocols.',
    content: `## Critical Incident Protocols: Core Network Failure
When a primary distribution or core switch fails unexpectedly, follow this cold-restart and configuration reload protocol.

### Phase 1: Rapid Physical & Out-of-Band Triaging
1. Connect via dedicated Out-of-Band (OOB) console server (Baud: 9600, 8-N-1, No Parity).
2. Validate redundant power supply modules (RPS):
   \`\`\`text
   show environment power
   show system alarms
   \`\`\`
3. Verify supervisor module status on modular chassis:
   \`\`\`text
   show module
   show redundancy state
   \`\`\`

### Phase 2: Resolving Broadcast Storms & Spanning Tree Loops
If network latency spikes to 100% and MAC flaps appear across interfaces:
\`\`\`text
show logging | include %SW_MATM-4-MACFLAP
show spanning-tree blockedports
\`\`\`
Immediately isolate the offending VLAN trunk:
\`\`\`text
configure terminal
interface TenGigabitEthernet1/1/1
 switchport trunk allowed vlan remove 100-200
end
\`\`\`

### Phase 3: Juniper JunOS Junoscript Rollback Protocol
To revert to the last known stable running configuration on Juniper MX/QFX switches:
\`\`\`text
rollback 1
commit check
commit confirmed 5
\`\`\`
Confirm connectivity before timeout expires; otherwise the switch automatically reloads the previous safe commit.`,
    category: 'Networking & Infrastructure',
    resourceType: 'manual',
    tags: ['Cisco', 'Juniper', 'Disaster Recovery', 'BGP', 'Spanning Tree', 'Datacenter'],
    fileName: 'cisco-juniper-core-dr-manual-rev4.docx',
    fileType: 'DOCX',
    fileSize: '2.1 MB',
    fileData: `ENTERPRISE CORE SWITCH DISASTER RECOVERY RUNBOOK
Author: Marcus Vance, CCIE Enterprise Infrastructure Emeritus
Version: 4.1
Last Certified: Q3 2026

EMERGENCY CONTACTS:
NOC Hotline: 1-800-555-DATA
TAC Severity 1 Portal: https://tac.internal.enterprise/urgent

1. Console Recovery Defaults
2. VTP and Spanning Tree Protocol Stabilizers
3. BGP Route Reflector Failover
4. Configuration Checksums and Backup Repositories
`,
    version: '4.1',
    author: 'Marcus Vance, Senior Infrastructure Architect',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    status: 'published',
    sourceUrl: 'https://docs.nexustech.internal/network-dr',
    license: 'Creative Commons Attribution-NonCommercial 4.0',
    downloadCount: 712,
    createdAt: '2026-07-20T11:15:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
  },
  {
    id: 'res-ad-kerberos',
    title: 'Active Directory & Kerberos PAC Hardening Suite & Remediation Scripts',
    shortDescription: 'PowerShell automated toolkit to identify unconstrained Kerberos delegation, Golden/Silver ticket vulnerabilities, and stale administrative SID histories.',
    content: `## Active Directory Modern Hardening Playbook

### Why Kerberos Delegation Requires Audit
Unconstrained delegation allows compromised servers to impersonate any user throughout your domain forest. This suite scans every computer account and gMSA to identify dangerous trust configurations.

### Automated PowerShell Audit Module
Included in this download is \`Audit-KerberosTrusts.ps1\`. Run this inside an elevated PowerShell 7.4 session on any management workstation with RSAT installed:

\`\`\`powershell
# Import Module
Import-Module .\\NexusKerberosGuard.psm1

# Execute Comprehensive Forest Scan
$Vulnerabilities = Invoke-ADKerberosHealthCheck -ScanType Comprehensive -ExportJsonPath .\\AD_Report.json

# View high risk accounts
$Vulnerabilities | Where-Object { $_.RiskLevel -eq 'CRITICAL' } | Format-Table Name, Issue, RecommendedAction
\`\`\`

### Hardening AES-256 Kerberos Encryption
To disable insecure RC4/DES encryption ciphers across all Domain Controllers:
\`\`\`powershell
Set-ADDefaultDomainPasswordPolicy -MinPasswordLength 16
# Enforce AES256 for Kerberos
Set-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Lsa\\Kerberos\\Parameters" -Name "SupportedEncryptionTypes" -Value 0x18 -Type DWord
\`\`\``,
    category: 'Sysadmin & Security',
    resourceType: 'solution',
    tags: ['Active Directory', 'PowerShell', 'Kerberos', 'Windows Server', 'Cybersecurity'],
    fileName: 'NexusKerberosHardeningSuite-v2.1.zip',
    fileType: 'ZIP',
    fileSize: '4.8 MB',
    fileData: `# NexusKerberosGuard PowerShell Module
function Invoke-ADKerberosHealthCheck {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$ScanType = "Standard"
    )
    Write-Host "[+] Querying Active Directory Forest for Unconstrained Delegation..." -ForegroundColor Cyan
    Write-Host "[✓] Analyzed 420 Computer objects" -ForegroundColor Green
    Write-Host "[!] Found 2 accounts with unconstrained delegation flags" -ForegroundColor Yellow
    Write-Host "[+] Remediation guide exported to report.html" -ForegroundColor Cyan
}
Export-ModuleMember -Function Invoke-ADKerberosHealthCheck
`,
    version: '2.1.4',
    author: 'Marcus Vance, Enterprise Security Lead',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    visibility: 'members_only',
    status: 'published',
    sourceUrl: 'https://github.com/nexustech/ad-kerberos-suite',
    license: 'MIT Enterprise License',
    downloadCount: 529,
    createdAt: '2026-06-11T08:00:00Z',
    updatedAt: '2026-10-02T10:20:00Z',
  },
  {
    id: 'res-aws-multiaz-vpc',
    title: 'Terraform AWS Multi-Region High-Availability VPC & Transit Gateway Blueprint',
    shortDescription: 'Production-ready Infrastructure as Code (IaC) modular templates with multi-AZ redundant NAT gateways, Flow Logs to S3 Glacier, and strict network ACLs.',
    content: `## Architecture Specifications
This Terraform blueprint provisions a secure, multi-tier virtual private cloud topology across 3 Availability Zones with automated VPC peering and centralized Transit Gateway attachment.

### Module Topology Highlights:
- **Public Subnets**: Ingress Load Balancers and Bastion Teleport Nodes.
- **Private App Subnets**: Application workloads, container nodes, and serverless interfaces.
- **Isolated Database Subnets**: Aurora Postgres / RDS clusters with zero egress to internet.
- **NAT Gateways**: Highly available, one dedicated gateway per AZ for failover isolation.

### Quickstart Execution:
\`\`\`bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Review execution plan
terraform plan -var-file="environments/production.tfvars"

# Apply with approval
terraform apply -var-file="environments/production.tfvars"
\`\`\`

### Sample Code (\`modules/vpc/main.tf\`):
\`\`\`hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "\${var.environment}-enterprise-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
\`\`\``,
    category: 'Cloud Architecture',
    resourceType: 'solution',
    tags: ['AWS', 'Terraform', 'VPC', 'Transit Gateway', 'IaC', 'Cloud Architecture'],
    fileName: 'terraform-aws-multiaz-vpc-blueprint.yaml',
    fileType: 'YAML',
    fileSize: '840 KB',
    fileData: `# Terraform AWS High Availability Multi-AZ VPC Manifest
terraform:
  required_version: ">= 1.8.0"
  required_providers:
    aws:
      source: "hashicorp/aws"
      version: "~> 5.40"

variables:
  environment: "production"
  region: "us-east-1"
  vpc_cidr: "10.100.0.0/16"
  availability_zones:
    - "us-east-1a"
    - "us-east-1b"
    - "us-east-1c"
`,
    version: '1.4.0',
    author: 'Marcus Vance, AWS Certified Solutions Architect Pro',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    status: 'published',
    sourceUrl: 'https://github.com/nexustech/terraform-aws-vpc',
    license: 'Apache 2.0',
    downloadCount: 1104,
    createdAt: '2026-05-04T12:00:00Z',
    updatedAt: '2026-09-25T13:45:00Z',
  },
  {
    id: 'res-linux-oom-incident',
    title: 'Linux Kernel Memory Depletion & OOM Killer Root Cause Playbook',
    shortDescription: 'Field-tested troubleshooting runbook for diagnosing memory leaks, page cache bloat, cgroup v2 memory limits, and slab cache fragmentation on RHEL / Ubuntu servers.',
    content: `## Triage Protocol: Kernel OOM Killer Invocation
When critical system processes (e.g., PostgreSQL, Java, NGINX) terminate with \`Out of Memory: Killed process\`, follow this systematic diagnostic flow.

### Step 1: Immediate Log Extraction
\`\`\`bash
# Inspect OOM killer decisions and memory state at the crash timestamp
dmesg -T | grep -i -E 'oom[-_]killer|killed process' -B 5 -A 20

# View kernel journal specifically for memory allocation events
journalctl -k --since "2 hours ago" | grep -i oom
\`\`\`

### Step 2: Analyze Swap, Buffers, and Slab Fragmentation
\`\`\`bash
# Examine virtual memory statistics
vmstat -SM 1 10

# Check kernel slab allocations
slabtop -s c
cat /proc/meminfo | grep -E 'MemAvailable|Cached|Buffers|SReclaimable|SUnreclaim'
\`\`\`

### Step 3: Mitigating Dirty Page Writeback Stalls
If heavy disk I/O causes sudden burst memory starvation, tune sysctl parameters:
\`\`\`bash
# Edit /etc/sysctl.d/99-memory-tuning.conf
vm.dirty_background_ratio = 5
vm.dirty_ratio = 10
vm.swappiness = 10
vm.vfs_cache_pressure = 50

# Apply changes immediately
sysctl -p /etc/sysctl.d/99-memory-tuning.conf
\`\`\`

### Step 4: CGroup Memory Limit Inspection
For Docker or Containerd workloads:
\`\`\`bash
# For systemd cgroups v2
cat /sys/fs/cgroup/system.slice/memory.events
cat /sys/fs/cgroup/system.slice/memory.current
\`\`\``,
    category: 'Troubleshooting & Runbooks',
    resourceType: 'guide',
    tags: ['Linux', 'Ubuntu', 'RHEL', 'Kernel', 'Memory Leak', 'OOM Killer'],
    fileName: 'linux-kernel-oom-investigation-playbook.txt',
    fileType: 'TXT',
    fileSize: '154 KB',
    fileData: `LINUX OOM KILLER TROUBLESHOOTING CHEATSHEET
===================================================
1. Verify what killed the process:
   journalctl -xb | grep -i "out of memory"

2. Inspect per-process virtual memory consumption:
   ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem | head -n 20

3. Check if slab memory is exhausted:
   cat /proc/buddyinfo

4. Adjust oom_score_adj for mission-critical processes:
   echo -1000 > /proc/$(pidof postgres)/oom_score_adj
`,
    version: '2.5',
    author: 'Marcus Vance, Red Hat Certified Architect',
    thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    status: 'published',
    sourceUrl: 'https://linux.nexustech.internal/oom-guide',
    license: 'Public Technical Documentation',
    downloadCount: 940,
    createdAt: '2026-04-18T15:20:00Z',
    updatedAt: '2026-08-30T11:10:00Z',
  },
  {
    id: 'res-db-failover-postgres',
    title: 'PostgreSQL Enterprise High-Availability Failover Architecture & Patroni Manual',
    shortDescription: 'Complete architecture blueprint for zero-data-loss PostgreSQL clustering with Patroni, etcd consensus distributed state, and HAProxy load balancing.',
    content: `## High-Availability PostgreSQL Clustering Architecture
Designed for sub-5-second automatic failover without split-brain anomalies.

### Component Architecture:
1. **Consensus Cluster**: 3-node etcd v3.5 cluster providing heartbeat locking.
2. **Database Nodes**: 1 Primary Writer, 2 Synchronous Replicas utilizing physical streaming replication.
3. **Failover Orchestrator**: Patroni agent co-located on each PostgreSQL host.
4. **Virtual IP / Proxy**: Keepalived with HAProxy directing TCP 5432 to current primary.

### Patroni Configuration Snippet (\`/etc/patroni/postgres.yml\`):
\`\`\`yaml
scope: db-cluster-prod
namespace: /service
name: pg-node-01

etcd3:
  hosts:
    - 10.0.10.11:2379
    - 10.0.10.12:2379
    - 10.0.10.13:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        max_connections: 500
        shared_buffers: 16GB
        wal_level: replica
        synchronous_commit: "on"
\`\`\`

### Safe Manual Failover Command
\`\`\`bash
patronictl -c /etc/patroni/postgres.yml switchover --master pg-node-01 --candidate pg-node-02 --scheduled now
\`\`\``,
    category: 'Databases & Storage',
    resourceType: 'manual',
    tags: ['PostgreSQL', 'Patroni', 'etcd', 'High Availability', 'Database Administration'],
    fileName: 'postgresql-patroni-ha-architecture-spec.pdf',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    fileData: `POSTGRESQL ENTERPRISE FAILOVER SPECIFICATION
DCS Engine: etcd3
Orchestrator: Patroni 3.2
Database: PostgreSQL 16.4 Enterprise Edition
Author: Marcus Vance

Failover SLA: RTO < 5 seconds, RPO = 0 (Synchronous Replication)
Backup Strategy: Daily pgBackRest Full Backups + Continuous WAL Archiving to S3
`,
    version: '3.0.1',
    author: 'Marcus Vance, Principal Infrastructure Architect',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    visibility: 'members_only',
    status: 'published',
    sourceUrl: 'https://github.com/nexustech/postgres-patroni-ha',
    license: 'NexusTech Enterprise License',
    downloadCount: 462,
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-09-12T09:40:00Z',
  },
  {
    id: 'res-docker-k8s-checklist',
    title: 'Docker Swarm to Production Kubernetes Migration Checklist & Spreadsheets',
    shortDescription: 'Comprehensive spreadsheet and validation checklist covering volume persistence, ingress transitions, secret rotation, and rolling cutover strategy.',
    content: `## Migration Phases: Swarm to K8s

### 1. Ingress & Reverse Proxy Translation
- Map Docker compose \`traefik.http.routers\` labels to Kubernetes Ingress / Gateway API resources.
- Provision cert-manager for automatic ACME Let's Encrypt certificates.

### 2. Stateful Data Persistence
- Migrate local Docker volumes to CSI persistent volumes (Ceph, EBS gp3, or NFS).
- Validate UID/GID filesystem permission mappings between Docker host users and K8s \`fsGroup\` settings.

### 3. Service Discovery & Secret Handling
- Convert Docker Secrets to Kubernetes sealed secrets or external secrets operator connected to AWS Secrets Manager or HashiCorp Vault.
- Update internal microservice DNS names from \`service-name\` to \`service-name.namespace.svc.cluster.local\`.

### 4. Zero-Downtime DNS Cutover
- Lower DNS TTL on public records to 60 seconds 72 hours prior to cutover.
- Configure parallel health checks on old Swarm VIP and new K8s LoadBalancer.`,
    category: 'Cloud & Containers',
    resourceType: 'guide',
    tags: ['Docker', 'Kubernetes', 'Migration', 'DevOps', 'Containers'],
    fileName: 'swarm-to-k8s-enterprise-checklist.xlsx',
    fileType: 'XLSX',
    fileSize: '620 KB',
    fileData: `Migration Item,Category,Assigned Engineer,Testing Status,Rollback Strategy
VPC Ingress Controller,Networking,Marcus Vance,Passed,Fail back to Traefik VIP
Persistent Volume Backup,Storage,DevOps Team,Verified,Restore Velero Snapshot
Secrets Vault Integration,Security,SecOps,In Progress,Use SealedSecrets
DNS Cutover Dry Run,Operations,NOC,Scheduled,Revert Route53 Weighted Records
`,
    version: '1.2.0',
    author: 'Marcus Vance, IT Systems Architect',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
    visibility: 'public',
    status: 'published',
    sourceUrl: 'https://github.com/nexustech/migration-templates',
    license: 'Open Access IT Resource',
    downloadCount: 880,
    createdAt: '2026-02-14T14:00:00Z',
    updatedAt: '2026-07-19T08:30:00Z',
  },
  {
    id: 'res-powershell-compliance',
    title: 'Enterprise Windows Server 2025 CIS Benchmark Compliance Suite',
    shortDescription: 'Production-ready PowerShell automation script to harden Windows Server 2025 against credential dumping, LLMNR poisoning, and unauthorized remote access.',
    content: `## Automated Windows Server 2025 Hardening

### Features of the Script:
1. **Credential Guard Enforcement**: Enables Virtualization-based Security (VBS) and LSA protection.
2. **Network Attack Surface Reduction**: Disables legacy LLMNR, NetBIOS over TCP/IP, and SMBv1.
3. **Advanced Audit Policy**: Configures detailed PowerShell script block logging and process creation command line auditing (Event ID 4688).
4. **AppLocker & WDAC**: Baseline policies restricting script execution to signed administrators.

### Usage:
\`\`\`powershell
# Open Administrator PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Dry-run audit mode
.\\Apply-WindowsHardening.ps1 -Mode AuditOnly -ExportReport .\\audit.csv

# Apply remediation with automatic rollback checkpoint
.\\Apply-WindowsHardening.ps1 -Mode Enforce -CreateSystemRestorePoint
\`\`\``,
    category: 'Sysadmin & Security',
    resourceType: 'solution',
    tags: ['Windows Server', 'PowerShell', 'CIS Benchmark', 'Hardening', 'Automation'],
    fileName: 'Apply-WindowsHardening-2025.ps1',
    fileType: 'SCRIPT',
    fileSize: '310 KB',
    fileData: `<#
.SYNOPSIS
Enterprise Windows Server 2025 CIS Benchmark Automation Script
Author: Marcus Vance, NexusTech IT Resource Hub
#>
[CmdletBinding()]
param(
    [ValidateSet('AuditOnly', 'Enforce')]
    [string]$Mode = 'AuditOnly'
)

Write-Host "[$Mode] Starting CIS Benchmark Remediation..." -ForegroundColor Green

# 1. Disable LLMNR
$RegistryPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient"
if (-not (Test-Path $RegistryPath)) { New-Item -Path $RegistryPath -Force | Out-Null }
Set-ItemProperty -Path $RegistryPath -Name "EnableMulticast" -Value 0 -Type DWord
Write-Host "[+] LLMNR Disabled successfully." -ForegroundColor Cyan

# 2. Enforce PowerShell ScriptBlock Logging
$PSAuditPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging"
if (-not (Test-Path $PSAuditPath)) { New-Item -Path $PSAuditPath -Force | Out-Null }
Set-ItemProperty -Path $PSAuditPath -Name "EnableScriptBlockLogging" -Value 1 -Type DWord
Write-Host "[+] ScriptBlock Logging enabled." -ForegroundColor Cyan

Write-Host "[✓] Windows Server Compliance run finished." -ForegroundColor Green
`,
    version: '2.0.3',
    author: 'Marcus Vance, Enterprise Security Lead',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    visibility: 'members_only',
    status: 'published',
    sourceUrl: 'https://github.com/nexustech/windows-server-hardening',
    license: 'NexusTech Member License',
    downloadCount: 645,
    createdAt: '2026-01-20T16:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'res-tls-pki-deepdive',
    title: 'Enterprise Internal PKI & Automated Certificate Management Tutorial',
    shortDescription: 'Step-by-step master tutorial for building an internal two-tier Public Key Infrastructure (PKI) with Root CA offline, Subordinate CA, and ACME auto-enrollment.',
    content: `## Building an Enterprise Two-Tier PKI

### Architectural Layers
1. **Root Certification Authority (Offline)**: Standalone, air-gapped root certificate authority with 20-year RSA 4096 / ECC NIST P-384 root key.
2. **Issuing Intermediate CA (Online)**: High-availability intermediate authority issuing TLS certificates with 3-year maximum lifespan.
3. **Automated Issuance Protocol (ACME / SCEP)**: Step-CA or HashiCorp Vault providing zero-touch automatic renewal for internal Kubernetes clusters, servers, and VPN endpoints.

### Tutorial Overview:
- Generating cryptographic parameters with OpenSSL 3.2.
- Designing strict Certificate Revocation Lists (CRL) and Online Certificate Status Protocol (OCSP) responders.
- Creating automated renewal cron jobs and cert-manager issuers.
- Distributing Root CA trust anchors to Windows Group Policy (GPO), Linux system ca-certificates trust store, and macOS profiles.`,
    category: 'Security & DevOps',
    resourceType: 'tutorial',
    tags: ['PKI', 'Cryptography', 'OpenSSL', 'TLS', 'Certificates', 'Tutorial'],
    fileName: 'internal-enterprise-pki-deployment-guide.pdf',
    fileType: 'PDF',
    fileSize: '5.1 MB',
    fileData: `ENTERPRISE PKI DEPLOYMENT GUIDE
Author: Marcus Vance, Principal Security Architect
Modules Covered:
1. Two-Tier Hierarchy Philosophy
2. Air-gapped Root Signing Ceremonies
3. Issuing Intermediate CA Configuration
4. Automated ACME Engine Integration
`,
    version: '1.0.0',
    author: 'Marcus Vance, CISO Advisor',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    visibility: 'members_only',
    status: 'published',
    sourceUrl: 'https://nexustech.internal/tutorials/pki',
    license: 'Members Only Technical Resource',
    downloadCount: 410,
    createdAt: '2025-11-18T10:00:00Z',
    updatedAt: '2026-06-15T14:00:00Z',
  },
  {
    id: 'res-ransomware-sop',
    title: 'Enterprise Ransomware Incident Containment & Recovery SOP Runbook',
    shortDescription: 'Emergency incident response standard operating procedures for isolating affected Active Directory networks, air-gapped backup preservation, and forensic triage.',
    content: `## Ransomware Crisis Protocol (Severity-0 Incident)

### First 15 Minutes: Containment Checklist
1. **Network Severance**: Do NOT power down affected endpoints (preserves volatile memory RAM artifacts). Disconnect Ethernet patch cords and disable Wi-Fi/Bluetooth immediately.
2. **Domain Isolation**:
   - Sever inter-site Active Directory replication tunnels to branch locations.
   - Restrict Kerberos ticket maximum lifetime to 2 hours.
   - Disable all Tier-0 enterprise admin service accounts known to be compromised.
3. **Air-Gap Backup Verification**:
   - Confirm immutability flags on secondary object storage and write-once-read-many (WORM) tape libraries.
   - Suspend all automatic backup sync jobs to prevent encrypted files from overwriting healthy snapshots.

### Forensic Triage Steps:
\`\`\`bash
# Collect memory dump using LiME (Linux) or WinPmem (Windows)
# Extract volatile network connections
netstat -ano > C:\\Triage\\network_active.txt
# Export event logs for lateral movement analysis
wevtutil epl Security C:\\Triage\\Security_Log.evtx
\`\`\``,
    category: 'Troubleshooting & Runbooks',
    resourceType: 'guide',
    tags: ['Cybersecurity', 'Incident Response', 'Ransomware', 'Forensics', 'SOP'],
    fileName: 'ransomware-incident-containment-sop.docx',
    fileType: 'DOCX',
    fileSize: '1.8 MB',
    fileData: `ENTERPRISE RANSOMWARE CONTAINMENT STANDARD OPERATING PROCEDURE
Severity: Sev-0
Distribution: Executive Leadership, CISO, Lead IR Responders
Key Directives:
1. Do not reboot infected machines (protect RAM memory state)
2. Sever WAN MPLS links between data centers immediately
3. Verify immutable backup state
`,
    version: '3.1.0',
    author: 'Marcus Vance, CISSP',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
    visibility: 'members_only',
    status: 'published',
    sourceUrl: 'https://security.nexustech.internal/ransomware-sop',
    license: 'Confidential Enterprise IT Document',
    downloadCount: 588,
    createdAt: '2025-10-05T09:00:00Z',
    updatedAt: '2026-08-14T11:00:00Z',
  },
];
