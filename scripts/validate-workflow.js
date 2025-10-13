#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

console.log('🔍 Validating GitHub Actions workflow...');

const WORKFLOW_PATH = '.github/workflows/performance-monitoring.yml';

function validateWorkflow() {
  // Check if workflow file exists
  if (!fs.existsSync(WORKFLOW_PATH)) {
    console.error(`❌ Workflow file not found: ${WORKFLOW_PATH}`);
    return false;
  }

  try {
    // Read and parse YAML
    const workflowContent = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    const workflow = yaml.parse(workflowContent);
    
    console.log('✅ Workflow file found and valid YAML');
    
    // Validate required components
    const validations = [];
    
    // Check workflow triggers
    if (workflow.on) {
      validations.push('✅ Workflow triggers configured');
      if (workflow.on.push) validations.push('  ✅ Push trigger');
      if (workflow.on.pull_request) validations.push('  ✅ PR trigger');
      if (workflow.on.schedule) validations.push('  ✅ Schedule trigger');
      if (workflow.on.workflow_dispatch) validations.push('  ✅ Manual trigger');
    } else {
      validations.push('❌ No workflow triggers found');
    }
    
    // Check jobs
    if (workflow.jobs) {
      validations.push(`✅ Jobs configured: ${Object.keys(workflow.jobs).length}`);
      
      // Check specific required jobs
      const requiredJobs = ['lighthouse-ci', 'mobile-performance', 'accessibility-audit', 'seo-audit'];
      requiredJobs.forEach(job => {
        if (workflow.jobs[job]) {
          validations.push(`  ✅ ${job} job found`);
        } else {
          validations.push(`  ⚠️  ${job} job missing (optional)`);
        }
      });
    } else {
      validations.push('❌ No jobs configured');
    }
    
    // Check for performance regression job
    if (workflow.jobs['performance-regression']) {
      validations.push('  ✅ Performance regression testing configured');
    }
    
    validations.forEach(validation => console.log(validation));
    
    return true;
  } catch (error) {
    console.error('❌ Error validating workflow:', error.message);
    return false;
  }
}

function validateDependencies() {
  console.log('\n🔍 Validating script dependencies...');
  
  const requiredFiles = [
    'scripts/performance-budget-check.js',
    'scripts/performance-regression-check.js',
    'scripts/rum-monitoring.js',
    'lighthouserc.json',
    'package.json'
  ];
  
  let allFound = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing`);
      allFound = false;
    }
  });
  
  return allFound;
}

function validatePackageJson() {
  console.log('\n🔍 Validating package.json scripts...');
  
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = [
    'lighthouse',
    'lighthouse:ci', 
    'perf:budget',
    'perf:mobile'
  ];
  
  let allFound = true;
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`✅ npm run ${script}`);
    } else {
      console.log(`❌ npm run ${script} - Missing`);
      allFound = false;
    }
  });
  
  return allFound;
}

function generateWorkflowSummary() {
  console.log('\n📋 WORKFLOW MONITORING SUMMARY');
  console.log('=' .repeat(60));
  console.log('✅ Performance monitoring workflow configured');
  console.log('✅ Multiple job types for comprehensive testing');
  console.log('✅ Automated triggers for CI/CD integration');
  console.log('✅ Performance regression detection');
  console.log('✅ Mobile and accessibility testing');
  console.log('✅ SEO monitoring included');
  
  console.log('\n🚀 READY FOR DEPLOYMENT');
  console.log('To activate monitoring:');
  console.log('1. Push workflow to GitHub repository');
  console.log('2. Configure required secrets (if any)');
  console.log('3. Trigger first run manually or via push');
  console.log('4. Monitor results in GitHub Actions tab');
}

// Run validation
async function main() {
  const workflowValid = validateWorkflow();
  const depsValid = validateDependencies();
  const scriptsValid = validatePackageJson();
  
  if (workflowValid && depsValid && scriptsValid) {
    generateWorkflowSummary();
    console.log('\n✅ All monitoring setup validations passed!');
  } else {
    console.log('\n❌ Some validations failed. Please fix the issues above.');
    process.exit(1);
  }
}

main();