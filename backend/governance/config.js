module.exports={
  caseType:'approved_test_generation_run',initialState:'run_registered',
  states:['run_registered','inputs_versioned','sandbox_queued','artifacts_recorded','evaluation_recorded','review_pending','write_approved','export_queued','exported','provider_failed','retry_pending','dead_lettered','closed'],
  createRoles:['developer','test_manager'],assessmentRoles:['developer','quality_reviewer','security_reviewer'],auditRoles:['test_manager','security_reviewer','auditor'],connectorRoles:['integration_operator','test_manager'],
  evidenceKinds:['repository_revision','configuration_version','secret_reference','sandbox_manifest','generated_artifact','evaluation_report','correctness_report','reliability_report','latency_cost_report','regression_report','concurrency_report','security_report','approval_record','export_receipt','provider_failure','retry_record','dead_letter_record'],
  requiredSignals:['repositoryVersion','configurationVersion','generatorVersion','sandboxVersion','fixtureVersion','policyVersion','safetyLimitsVerified','correctnessScore','reliabilityScore','p95LatencyMs','costPerRun','regressionDelta','concurrencyRecoveryScore','secretBoundaryStatus'],
  professionalBoundary:'Generated tests and code remain untrusted artifacts. The workflow never executes code, accesses repositories, exposes secrets, writes branches, triggers CI, or opens tickets without sandboxing and explicit human approval.',
  connectors:[{name:'repository',purpose:'signed read snapshots and approved write receipts'},{name:'ci_cd',purpose:'queued contract-test and export receipts'},{name:'model_provider',purpose:'generation receipts only'},{name:'telemetry',purpose:'versioned execution metrics'},{name:'secret_manager',purpose:'opaque credential references only'},{name:'artifact_store',purpose:'immutable artifact pointers and digests'},{name:'ticketing',purpose:'approved issue and review receipts'}],
  transitions:[
    {from:'run_registered',action:'lock_inputs',to:'inputs_versioned',roles:['developer'],requiresEvidence:true},
    {from:'inputs_versioned',action:'queue_sandbox',to:'sandbox_queued',roles:['developer','integration_operator'],requiresEvidence:true},
    {from:'sandbox_queued',action:'record_artifacts',to:'artifacts_recorded',roles:['integration_operator'],requiresEvidence:true},
    {from:'artifacts_recorded',action:'record_evaluation',to:'evaluation_recorded',roles:['quality_reviewer','security_reviewer'],requiresEvidence:true,dualControl:true},
    {from:'evaluation_recorded',action:'submit_review',to:'review_pending',roles:['quality_reviewer','security_reviewer'],requiresEvidence:true,dualControl:true},
    {from:'review_pending',action:'approve_write',to:'write_approved',roles:['test_manager','security_reviewer'],requiresEvidence:true,dualControl:true},
    {from:'write_approved',action:'queue_export',to:'export_queued',roles:['test_manager'],requiresEvidence:true,dualControl:true},
    {from:'export_queued',action:'record_export',to:'exported',roles:['integration_operator'],requiresEvidence:true},
    {from:'export_queued',action:'record_provider_failure',to:'provider_failed',roles:['integration_operator'],requiresEvidence:true},
    {from:'provider_failed',action:'record_retry',to:'retry_pending',roles:['integration_operator','developer'],requiresEvidence:true},
    {from:'retry_pending',action:'queue_export',to:'export_queued',roles:['test_manager','integration_operator'],requiresEvidence:true},
    {from:'provider_failed',action:'record_dead_letter',to:'dead_lettered',roles:['test_manager','integration_operator'],requiresEvidence:true,dualControl:true},
    {from:'exported',action:'close_run',to:'closed',roles:['test_manager','auditor'],requiresEvidence:true},
    {from:'dead_lettered',action:'close_run',to:'closed',roles:['test_manager','auditor'],requiresEvidence:true}
  ],
  acceptedFixture:{repositoryVersion:'git1',configurationVersion:'cfg1',generatorVersion:'gen1',sandboxVersion:'sb1',fixtureVersion:'fx1',policyVersion:'p1',safetyLimitsVerified:true,correctnessScore:0.98,reliabilityScore:0.99,p95LatencyMs:900,costPerRun:1.5,regressionDelta:0.01,concurrencyRecoveryScore:0.97,secretBoundaryStatus:'passed'},
  rejectedFixture:{repositoryVersion:'git1',configurationVersion:'cfg1',generatorVersion:'gen1',sandboxVersion:'sb1',fixtureVersion:'fx1',policyVersion:'p1',safetyLimitsVerified:false,correctnessScore:0.98,reliabilityScore:0.99,p95LatencyMs:900,costPerRun:1.5,regressionDelta:0.01,concurrencyRecoveryScore:0.97,secretBoundaryStatus:'passed'},
  readyDisposition:'independent_test_artifact_review_required',holdDisposition:'sandbox_correctness_reliability_or_secret_hold',decisionField:'repositoryWriteCommand',
  assess:x=>{const correctness=Number(x.correctnessScore),reliability=Number(x.reliabilityScore),latency=Number(x.p95LatencyMs),cost=Number(x.costPerRun),regression=Number(x.regressionDelta),recovery=Number(x.concurrencyRecoveryScore);const ready=x.safetyLimitsVerified===true&&correctness>=0.95&&reliability>=0.98&&latency<=1200&&cost<=2&&regression<=0.02&&recovery>=0.95&&x.secretBoundaryStatus==='passed';return{disposition:ready?'independent_test_artifact_review_required':'sandbox_correctness_reliability_or_secret_hold',repositoryWriteCommand:null,executionCommand:null,metrics:{correctness,reliability,latency,cost,regression,recovery},versions:{repository:x.repositoryVersion,configuration:x.configurationVersion,generator:x.generatorVersion,sandbox:x.sandboxVersion,fixture:x.fixtureVersion}};}
};
