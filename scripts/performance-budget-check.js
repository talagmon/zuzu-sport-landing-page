#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Performance budgets
const PERFORMANCE_BUDGETS = {
  performance: 0.6,
  accessibility: 0.85,
  'best-practices': 0.9,
  seo: 0.95,
  
  // Core Web Vitals (in milliseconds)
  'first-contentful-paint': 4000,
  'largest-contentful-paint': 6000,
  'total-blocking-time': 300,
  'cumulative-layout-shift': 0.1,
  
  // Resource budgets (in KB)
  'total-byte-weight': 1000,
  'dom-size': 1500,
};

function checkPerformanceBudget() {
  const lighthouseDir = '.lighthouseci';
  
  if (!fs.existsSync(lighthouseDir)) {
    console.error('❌ Lighthouse CI results not found!');
    process.exit(1);
  }
  
  const reportFiles = fs.readdirSync(lighthouseDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(lighthouseDir, file));
  
  if (reportFiles.length === 0) {
    console.error('❌ No Lighthouse reports found!');
    process.exit(1);
  }
  
  let allPassed = true;
  const results = [];
  
  reportFiles.forEach((reportFile, index) => {
    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    const url = report.finalUrl || `Page ${index + 1}`;
    
    console.log(`\n📊 Checking performance budget for: ${url}`);
    console.log('=' .repeat(60));
    
    const pageResults = {
      url,
      passed: true,
      violations: [],
      metrics: {}
    };
    
    // Check category scores
    Object.entries(report.categories).forEach(([category, data]) => {
      const budget = PERFORMANCE_BUDGETS[category];
      if (budget && data.score < budget) {
        const violation = `${category}: ${(data.score * 100).toFixed(1)}% (budget: ${(budget * 100).toFixed(1)}%)`;
        console.log(`❌ ${violation}`);
        pageResults.violations.push(violation);
        pageResults.passed = false;
        allPassed = false;
      } else if (budget) {
        console.log(`✅ ${category}: ${(data.score * 100).toFixed(1)}%`);
      }
      pageResults.metrics[category] = data.score;
    });
    
    // Check Core Web Vitals
    const audits = report.audits;
    ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'].forEach(metric => {
      if (audits[metric]) {
        const value = audits[metric].numericValue;
        const budget = PERFORMANCE_BUDGETS[metric];
        const unit = metric === 'cumulative-layout-shift' ? '' : 'ms';
        
        if (value > budget) {
          const violation = `${metric}: ${value.toFixed(1)}${unit} (budget: ${budget}${unit})`;
          console.log(`❌ ${violation}`);
          pageResults.violations.push(violation);
          pageResults.passed = false;
          allPassed = false;
        } else {
          console.log(`✅ ${metric}: ${value.toFixed(1)}${unit}`);
        }
        pageResults.metrics[metric] = value;
      }
    });
    
    results.push(pageResults);
  });
  
  // Generate summary
  console.log('\n📋 PERFORMANCE BUDGET SUMMARY');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    if (result.passed) {
      console.log(`✅ ${result.url} - All budgets passed`);
    } else {
      console.log(`❌ ${result.url} - ${result.violations.length} violation(s):`);
      result.violations.forEach(violation => {
        console.log(`   • ${violation}`);
      });
    }
  });
  
  // Generate performance report
  const reportData = {
    timestamp: new Date().toISOString(),
    passed: allPassed,
    results,
    budgets: PERFORMANCE_BUDGETS
  };
  
  fs.writeFileSync('performance-budget-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Performance budget report saved to: performance-budget-report.json');
  
  if (!allPassed) {
    console.log('\n❌ Performance budget check FAILED!');
    process.exit(1);
  } else {
    console.log('\n✅ All performance budgets PASSED!');
  }
}

// Run the check
checkPerformanceBudget();