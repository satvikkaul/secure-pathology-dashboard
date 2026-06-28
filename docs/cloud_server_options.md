**Cloud Server O tions for a Secure Patholo Ima e Anal sis Dashboard p gy g y** 

_Compliance-aware cloud options, Canada-region pricing, and workload scaling comparison_ 

_Prepared for project planning | Pricing reviewed: May 28, 2026 | Currency: USD unless stated otherwise_ 

## **1. Purpose and Scope** 

**Purpose.** This document compares viable cloud server options for a secure pathology image analysis dashboard. The dashboard is expected to support authenticated users, pathology image uploads, algorithm selection, AI/image-processing execution, protected result viewing, and later expansion to additional algorithms or menu components. 

**Scope.** The comparison focuses on reputable cloud providers that can support healthcare workloads with HIPAA, PIPEDA, and Ontario PHIPA-aligned safeguards when configured correctly and reviewed by the institution/legal/privacy team. 

## **2. Pricing Comparison: Canada-Region Compute Costs** 

Monthly cost = hourly on-demand rate x 730 hours. These are compute/server estimates only; storage, database, logs, backups, and network costs are handled separately in the scenario table. 

|**Provider**|**Region**|**Instance**|**Hourly**|**730h monthly**|**Best use**|
|---|---|---|---|---|---|
|AWS|ca-central-1 / Canada<br>Central|t3.medium: 2 vCPU, 4<br>GiB|$0.0464/hr|$33.87/mo|Light CPU API/backend|
|AWS|ca-central-1 / Canada<br>Central|t3.large: 2 vCPU, 8 GiB|$0.0928/hr|$67.74/mo|Small-to-medium<br>backend|
|AWS|ca-central-1 / Canada<br>Central|t3.xlarge: 4 vCPU, 16<br>GiB|$0.1856/hr|$135.49/mo|Medium backend /<br>worker node|
|Azure|Canada Central|D2s v5: 2 vCPU, 8 GiB|$0.107/hr|$78.11/mo|Light CPU API/backend|
|Azure|Canada Central|D4s v5: 4 vCPU, 16 GiB|$0.214/hr|$156.22/mo|Medium backend /<br>worker node|
|Azure|Canada Central|D8s v5: 8 vCPU, 32 GiB|$0.428/hr|$312.44/mo|Heavy CPU backend /<br>worker node|
|Google Cloud|northamerica-northeast2<br>/ Toronto|e2-standard-2: 2 vCPU,<br>8 GiB|$0.0753/hr|$54.95/mo|Light CPU API/backend|
|Google Cloud|northamerica-northeast2<br>/ Toronto|e2-standard-4: 4 vCPU,<br>16 GiB|$0.1490/hr|$108.81/mo|Medium backend /<br>worker node|
|Google Cloud|northamerica-northeast2<br>/ Toronto|e2-standard-8: 8 vCPU,<br>32 GiB|$0.2966/hr|$216.51/mo|Heavy CPU backend /<br>worker node|



Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

## **3. Always-On GPU Compute Pricing** 

GPU should not be assumed always-on unless the workload needs continuous inference. For a research build, scheduled/on-demand GPU jobs can reduce cost substantially. However, always-on pricing is shown because heavier usage may require it. 

|**Provider**|**Region**|**Instance**|**GPU/spec**|**Hourly**|**730h monthly**|**Best use**|
|---|---|---|---|---|---|---|
|AWS|ca-central-1|g4dn.xlarge|1 x NVIDIA T4, 4<br>vCPU,16 GiB|$0.584/hr|$426.32/mo|Entry GPU inference|
|AWS|ca-central-1|g4dn.2xlarge|1 x NVIDIA T4, 8<br>vCPU,32 GiB|$0.835/hr|$609.55/mo|More CPU/RAM<br>around same T4 GPU|
|AWS|ca-central-1|g4dn.4xlarge|1 x NVIDIA T4, 16<br>vCPU, 64 GiB|$1.337/hr|$976.01/mo|Heavier<br>preprocessing +<br>inference|
|AWS|ca-central-1|g5.xlarge|1 x NVIDIA A10G, 4<br>vCPU,16 GiB|$1.117/hr|$815.41/mo|Newer GPU, better<br>for heavier models|
|Azure|Canada Central|NC4as T4 v3|1 x NVIDIA T4, 4<br>vCPU,28 GiB|$0.584/hr|$426.32/mo|Entry GPU inference|
|Azure|Canada Central|NC16as T4 v3|1 x NVIDIA T4, 16<br>vCPU,110 GiB|$1.336/hr|$975.28/mo|Heavy CPU/RAM +<br>T4 inference|



- For google cloud: Toronto does not appear as a G2 region in the calculator. Do not use for Canada-region GPU budgeting. 

## **4. Scenario-Level Monthly Estimates** 

These ranges include compute plus a practical allowance for managed database, private object storage, backups/snapshots, logs/monitoring, queueing, secrets/key management, and light network overhead. 

|**Scenario**|**Assumed workload**|**AWS Canada**<br>**estimate**|**Azure Canada estimate**|**GCP Toronto estimate**|**Best value**|
|---|---|---|---|---|---|
|Lightweight prototype|Small number of internal<br>users; de-identified/synthetic<br>images; CPU-only inference<br>or occasional short GPU<br>jobs; no clinical use.|$120-$260/mo|$160-$320/mo|$140-$300/mo|Azure or AWS|
|Medium research<br>deployment|Authenticated users; private<br>image upload; managed DB;<br>object storage; audit logs;<br>queue; occasional GPU or<br>scheduled GPU job windows.|$350-$900/mo|$420-$1,000/mo|$450-$1,100/mo|AWS or Azure|
|Heavy / production-style<br>research|More users, larger pathology<br>images, stricter logging,<br>backups, monitoring, private<br>networking, and one always-<br>on GPU inference node.|$950-$2,000+/mo|$1,050-$2,200+/mo|$1,150-$2,500+/mo|AWS or Azure; GCP if<br>L4 is preferred|



Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

## **5. Pricing Assumptions** 

- All compute prices are approximate on-demand Linux/server rates in USD and use 730 hours/month for always-on monthly estimates. 

- Canada-region pricing is used where possible: AWS ca-central-1, Azure Canada Central, and Google Cloud northamerica-northeast2/Toronto. 

- The compute pricing table shows server costs only. The scenario estimates add rough allowances for managed database, object storage, backups, monitoring/logging, queueing, secrets/key management, and network overhead. 

- Costs exclude taxes, institutional discounts, support plans, reserved instances/savings plans, outbound data transfer/egress, domain/DNS, third-party identity services, penetration testing, legal review, and unusually large storage/backup retention. 

- Prices change frequently. Before procurement, rerun the exact architecture through AWS Pricing Calculator, Azure Pricing Calculator, and Google Cloud Pricing Calculator using the selected Canada region. 

## **6. Workload Definitions** 

|**Workload tier**|**Meaning in this project**|**Interpretation**|
|---|---|---|
|Lightweight|Internal demo or early prototype; small team; de-identified/synthetic<br>images; CPU inference or dummy algorithms; limited storage; no<br>continuous GPU.|Low cost, quick validation, not suitable for sensitive<br>production-like data without full controls.|
|Medium|Research pilot; authenticated users; private image uploads; managed<br>DB; private object storage; audit logs; queue; one or more real<br>algorithms; GPU used only during jobs or scheduled windows.|Best target for the first serious build. Balances<br>compliance-aware design, cost, and extensibility.|
|Heavy|Production-style research setup; multiple users; larger pathology<br>files; concurrent analysis jobs; private networking; stronger<br>monitoring; backups; always-on GPU or GPU autoscaling.|More realistic for sustained hospital/research usage,<br>but requires budget control and quota planning.|



## **7. Provider Analysis** 

## **7.1 Azure Canada Central** 

**Why it is strong.** Azure is likely the easiest organizational fit if the hospital or research team already uses Microsoft services. It has strong identity integration through Microsoft Entra ID, Canada Central data residency, Key Vault, Azure Monitor, private endpoints, managed PostgreSQL, Blob Storage, and container/GPU deployment options. 

**Cost position.** Azure Canada Central CPU instances are more expensive than lower US-region numbers. D2s v5 and D4s v5 should be treated as approximately $78.11/month and $156.22/month if always on. Entry T4 GPU pricing in Canada Central is roughly comparable to AWS g4dn.xlarge. 

**Best fit.** Best if hospital alignment, Microsoft identity, and Canada privacy documentation matter more than absolute lowest compute cost. 

Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

## **7.2 AWS Canada Central** 

**Why it is strong.** AWS is strong for modular architecture, containerized algorithms, object storage, queue-based workflows, scalable GPU nodes, and mature security controls. A typical design would use S3, RDS PostgreSQL, ECS/Fargate or EKS, IAM, KMS, CloudWatch, SQS, and VPC/private networking. 

**Cost position.** AWS has the lowest small CPU instance prices in this comparison. The Canada Central g4dn.xlarge GPU estimate of $0.584/hour is a Canada-region planning number; the lower $0.526/hour figure is a US-region baseline and should not be used for Canada Central budgeting. 

**Best fit.** Best if the team wants maximum flexibility for containerized algorithms, GPU inference, and cloud-native ML/platform engineering. 

## **7.3 Google Cloud Toronto** 

**Why it is strong.** Google Cloud is attractive for developer productivity, containers, managed services, and AI tooling. Toronto is available for CPU workloads and G2 GPU machines. 

**Cost position.** CPU costs are competitive, but the GPU comparison uses G2/L4 rather than an N1+T4 assumption. This makes the entry GPU estimate approximately $568/month always-on, higher than AWS/Azure T4 entry pricing but with a newer NVIDIA L4 GPU. 

**Best fit.** Best if the team prefers Google Cloud or wants L4-based GPU inference in Toronto. Less ideal if the requirement is specifically a T4 GPU in Toronto. 

## **8. Compliance and Privacy Considerations** 

**Important limitation.** A cloud provider being HIPAA-eligible or having Canadian privacy-law documentation does not automatically make the dashboard compliant. Compliance depends on the architecture, contracts, institutional approvals, configuration, access control, audit logging, encryption, data residency, data retention, incident response, and whether real patient data is used. 

- HIPAA: if ePHI is handled, a Business Associate Agreement may be required with the cloud provider, and the project must satisfy HIPAA Security Rule safeguards and risk analysis expectations where HIPAA applies. 

- PIPEDA: applies to many private-sector organizations in Canada that collect, use, or disclose personal information in commercial activity. 

- PHIPA: should be considered if Ontario personal health information is involved, especially through a hospital or health information custodian context. 

- Use Canada-region data residency by default unless the institution explicitly approves another region. 

- No raw images should be sent to external AI APIs or third-party model services unless a proper legal/privacy agreement and institutional approval are in place. 

- Administrative access to images should be clarified. If administrators should not view uploaded images, implement technical separation: object storage policies, role-based access control, encrypted storage, audit trails, and possibly break-glass procedures. 

## **9. Recommended Provider Choice** 

**Primary recommendation: Azure Canada Central if hospital Microsoft alignment matters.** Azure is likely the safest stakeholder-facing recommendation because many healthcare and university environments already use Microsoft identity and compliance tooling. It also has explicit Canadian privacy-law documentation referencing PIPEDA and Ontario PHIPA/FIPPA resources. 

**Technical/value alternative: AWS Canada Central.** AWS is arguably the best engineering/value option for modular algorithm execution, object storage, queues, containerized workloads, and scalable GPU inference. It also has lower small CPU compute cost in Canada Central. 

**Third option: Google Cloud Toronto.** GCP remains viable, especially if the team wants Google tooling or an L4 GPU through G2 machines in Toronto. However, if the team expects T4-specific GPU infrastructure in Toronto, that assumption should be corrected and verified. 

Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

## **10. Questions to Confirm Before Final Cloud Selection** 

1. Will real patient data be uploaded during the initial deployment, or only de-identified/synthetic images? 

2. Is Canadian data residency mandatory? 

3. Does the hospital or research team already require Azure, AWS, or GCP? 

4. Will users authenticate through hospital/institutional SSO, email/password, or separate research accounts? 

5. Can administrators view uploaded images, or should admin access be restricted to metadata only? 

6. Will algorithms run on CPU, GPU, or both? 

7. Should GPU nodes be always-on, scheduled, or created only when jobs are submitted? 

8. What is the expected image size and volume per month? 

9. What retention period is required for uploaded images and generated results? 

10. Is REB/ethics, privacy impact assessment, or threat-risk assessment required before using real data? 

## **11. Bottom-Line Recommendation** 

**Recommended starting approach.** Build the first serious deployment as a medium research deployment: secure login, private image upload, metadata database, modular algorithm runner, result viewer, audit logging, and Canada-region cloud deployment. Avoid assuming an always-on GPU until actual usage patterns are known, but budget for always-on GPU because heavier project usage may require it. 

**Most defensible provider recommendation.** Use Azure Canada Central if stakeholder alignment and institutional Microsoft integration are the priority. Use AWS Canada Central if engineering flexibility, lower CPU cost, and containerized AI workload control are the priority. Keep Google Cloud as viable but correct the GPU assumption to G2/L4 in Toronto. 

## **12. Compliance Support for HIPAA/ePHI, PIPEDA, and PHIPA** 

The three cloud providers reviewed - Microsoft Azure, Amazon Web Services, and Google Cloud, can support healthcare and medical-data workloads when configured correctly. However, none of these providers automatically makes the dashboard compliant. Compliance depends on the selected services, signed agreements, cloud configuration, encryption, access control, audit logging, data residency, institutional policies, and legal/privacy review. 

## **Microsoft Azure** 

Microsoft Azure supports healthcare workloads involving HIPAA and electronic protected health information (ePHI) through Microsoft’s Business Associate Agreement (BAA) for in-scope cloud services. Microsoft states that offering a BAA helps support HIPAA compliance, but using Azure or other Microsoft cloud services does not automatically make an organization or application HIPAA compliant. The organization remains responsible for its own compliance program, internal processes, and correct implementation of Azure services. 

For Canadian privacy requirements, Microsoft provides Azure compliance documentation and a Canadian Privacy Impact Assessment covering how Azure aligns with Canadian privacy laws, including PIPEDA, Ontario PHIPA, Ontario FIPPA, the Canadian Privacy Act, and ISO/IEC 27018. This 

Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

makes Azure a strong option when the project values Canadian privacy documentation, Microsoft identity integration, and institutional/hospital alignment. 

## **Amazon Web Services** 

AWS supports HIPAA workloads through its Business Associate Addendum (BAA). AWS states that the BAA is required under HIPAA rules to ensure AWS appropriately safeguards protected health information. For a dashboard handling ePHI, the project would need to use HIPAA-eligible AWS services, configure them securely, restrict access, encrypt data, maintain logging, and perform appropriate risk analysis. 

For Canadian privacy requirements, AWS provides Canada-focused privacy documentation. AWS notes that PIPEDA may apply to the collection, use, and disclosure of personal information in the private sector in Canada, and that provincial privacy laws may also apply depending on the context. AWS Canada Central can support core infrastructure services relevant to this project, such as compute, storage, database, identity/access management, encryption, monitoring, and networking, but the project team remains responsible for meeting PIPEDA/PHIPA obligations through correct architecture and governance. 

## **Google Cloud** 

Google Cloud supports HIPAA workloads through a Business Associate Agreement for covered Google Cloud services. Google states that the covered entity entering into the BAA is responsible for building the HIPAA-compliant solution using approved Google Cloud services and for implementing the required compliance controls. Therefore, Google Cloud can support ePHI workloads, but the dashboard must still be designed and configured correctly. 

For Canadian privacy requirements, Google Cloud provides PIPEDA and PHIPA resources. Google identifies PIPEDA as Canada’s federal privatesector privacy law for handling personal information in commercial activity, and its PHIPA resources state that Google Cloud products and policies help address PHIPA requirements around data protection and privacy for regulated entities in Canada. Google also provides Canadian healthcarefocused privacy assessment resources, including a Privacy Impact Assessment and Threat Risk Assessment, but customers remain responsible for their own due diligence and legal/privacy obligations. 

## **Practical Interpretation for This Project** 

For this pathology image analysis dashboard, Azure, AWS, and Google Cloud should be treated as compliance-capable platforms rather than compliant solutions by default. The project should use Canada-region hosting where possible, private storage, encryption at rest and in transit, leastprivilege access control, audit logging, backup/retention policies, and formal institutional review before real patient data is used. If ePHI or identifiable health information is involved, the team should confirm whether a BAA, privacy impact assessment, threat-risk assessment, REB/ethics approval, or hospital-specific privacy review is required before deployment. 

Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

## **12. Sources Reviewed** 

- HHS, Guidance on HIPAA & Cloud Computing: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html 

- HHS FAQ on cloud service providers and BAAs: https://www.hhs.gov/hipaa/for-professionals/faq/2075/may-a-hipaa-covered-entity-or-business-associate-use-cloud-service-to-store-or-processephi/index.html 

- AWS HIPAA Compliance: https://aws.amazon.com/compliance/hipaa-compliance/ 

- AWS Price List documentation: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html 

- AWS Pricing Calculator: https://calculator.aws/ 

- Azure Canada privacy laws documentation: https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-canada-privacy-laws 

- Microsoft HIPAA/HITECH compliance offering: https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech 

- Azure Linux Virtual Machines pricing: https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/ 

- Google Cloud HIPAA compliance: https://cloud.google.com/security/compliance/hipaa 

- Google Cloud Compute Engine regions/zones: https://docs.cloud.google.com/compute/docs/regions-zones 

- Google Cloud GPU regions/zones: https://docs.cloud.google.com/compute/docs/regions-zones/gpu-regions-zones 

- Google Cloud GPU machine types: https://docs.cloud.google.com/compute/docs/gpus 

- Office of the Privacy Commissioner of Canada, PIPEDA in brief: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documentsact-pipeda/pipeda_brief/ 

- Supplemental current pricing indexes reviewed for Canada-region prices: DoiT Compute, DevZero Instances, Instance Pricing, CloudOptimo, CloudPrice, and gcloud-compute. 

- Microsoft HIPAA/HITECH compliance offering: https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech 

- Azure Canada privacy laws documentation: https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-canada-privacy-laws 

- AWS HIPAA Compliance: https://aws.amazon.com/compliance/hipaa-compliance/ 

- AWS Canada Data Privacy: https://aws.amazon.com/compliance/canada-data-privacy/ 

- AWS Healthcare Compliance: https://aws.amazon.com/health/healthcare-compliance/ 

- Google Cloud HIPAA Compliance: https://cloud.google.com/security/compliance/hipaa-compliance 

- Google Cloud PIPEDA: https://cloud.google.com/security/compliance/pipeda-canada 

- Google Cloud PHIPA: https://cloud.google.com/security/compliance/phipa-canada 

Cloud Server Options for Secure Pathology Image Analysis Dashboard | Pricing reviewed May 28, 2026 

