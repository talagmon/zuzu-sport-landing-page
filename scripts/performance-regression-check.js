#!/usr/bin/env node

const fs = require('fs');

// Regression thresholds
const REGRESSION_THRESHOLDS = {
  performance: -0.05,         // 5% decrease
  accessibility: -0.02,       // 2% decrease
  'best-practices': -0.02,    // 2% decrease
  seo: -0.01,                 // 1% decrease
  
  'first-contentful-paint': 500,      // 500ms increase
  'largest-contentful-paint': 1000,   // 1000ms increase
  'total-blocking-time': 100,         // 100ms increase
  'cumulative-layout-shift': 0.02,    // 0.02 increase
};

function comparePerformance(baseFile, prFile) {
  if (!fs.existsSync(baseFile) || !fs.existsSync(prFile)) {
    console.error('❌ Performance report files not found!');
    process.exit(1);
  }
  
  const baseReport = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const prReport = JSON.parse(fs.readFileSync(prFile, 'utf8'));
  
  console.log('🔍 PERFORMANCE REGRESSION ANALYSIS');
  console.log('=' .repeat(60));
  console.log(`Base: ${baseReport.finalUrl}`);
  console.log(`PR:   ${prReport.finalUrl}`);
  console.log('');
  
  let hasRegression = false;
  const regressions = [];
  const improvements = [];
  
  // Compare category scores
  console.log('📊 Category Score Changes:');
  Object.entries(baseReport.categories).forEach(([category, baseData]) => {
    const prData = prReport.categories[category];
    if (!prData) return;
    
    const basScore = baseData.score;
    const prScore = prData.score;
    const change = prScore - basScore;
    const changePercent = (change * 100).toFixed(1);
    const threshold = REGRESSION_THRESHOLDS[category];
    
    if (threshold && change < threshold) {
      console.log(`❌ ${category}: ${(basScore * 100).toFixed(1)}% → ${(prScore * 100).toFixed(1)}% (${changePercent}%)`);
      regressions.push(`${category} decreased by ${Math.abs(changePercent)}%`);
      hasRegression = true;
    } else if (change > 0) {
      console.log(`✅ ${category}: ${(basScore * 100).toFixed(1)}% → ${(prScore * 100).toFixed(1)}% (+${changePercent}%)`);
      improvements.push(`${category} improved by ${changePercent}%`);
    } else {
      console.log(`➖ ${category}: ${(basScore * 100).toFixed(1)}% → ${(prScore * 100).toFixed(1)}% (${changePercent}%)`);
    }
  });
  
  // Compare Core Web Vitals
  console.log('\n🚀 Core Web Vitals Changes:');
  const coreWebVitals = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'];
  
  coreWebVitals.forEach(metric => {
    const baseAudit = baseReport.audits[metric];
    const prAudit = prReport.audits[metric];
    
    if (!baseAudit || !prAudit) return;
    
    const baseValue = baseAudit.numericValue;
    const prValue = prAudit.numericValue;
    const change = prValue - baseValue;
    const threshold = REGRESSION_THRESHOLDS[metric];
    const unit = metric === 'cumulative-layout-shift' ? '' : 'ms';
    
    if (threshold && change > threshold) {
      console.log(`❌ ${metric}: ${baseValue.toFixed(1)}${unit} → ${prValue.toFixed(1)}${unit} (+${change.toFixed(1)}${unit})`);
      regressions.push(`${metric} increased by ${change.toFixed(1)}${unit}`);
      hasRegression = true;
    } else if (change < 0) {
      console.log(`✅ ${metric}: ${baseValue.toFixed(1)}${unit} → ${prValue.toFixed(1)}${unit} (${change.toFixed(1)}${unit})`);
      improvements.push(`${metric} improved by ${Math.abs(change).toFixed(1)}${unit}`);
    } else {
      console.log(`➖ ${metric}: ${baseValue.toFixed(1)}${unit} → ${prValue.toFixed(1)}${unit} (+${change.toFixed(1)}${unit})`);
    }
  });
  
  // Generate summary
  console.log('\n📋 REGRESSION ANALYSIS SUMMARY');
  console.log('=' .repeat(60));
  
  if (regressions.length > 0) {
    console.log(`❌ Found ${regressions.length} performance regression(s):`);
    regressions.forEach(regression => {
      console.log(`   • ${regression}`);
    });
  }
  
  if (improvements.length > 0) {
    console.log(`✅ Found ${improvements.length} performance improvement(s):`);
    improvements.forEach(improvement => {
      console.log(`   • ${improvement}`);
    });
  }
  
  if (regressions.length === 0 && improvements.length === 0) {
    console.log('➖ No significant performance changes detected.');
  }
  
  // Save detailed comparison report
  const comparisonReport = {
    timestamp: new Date().toISOString(),
    hasRegression,
    regressions,
    improvements,
    baseUrl: baseReport.finalUrl,
    prUrl: prReport.finalUrl,
    thresholds: REGRESSION_THRESHOLDS,
    details: {
      categories: {},
      coreWebVitals: {}
    }
  };
  
  // Add detailed metrics
  Object.keys(baseReport.categories).forEach(category => {
    if (prReport.categories[category]) {
      comparisonReport.details.categories[category] = {
        base: baseReport.categories[category].score,
        pr: prReport.categories[category].score,
        change: prReport.categories[category].score - baseReport.categories[category].score
      };
    }
  });
  
  coreWebVitals.forEach(metric => {
    if (baseReport.audits[metric] && prReport.audits[metric]) {
      comparisonReport.details.coreWebVitals[metric] = {
        base: baseReport.audits[metric].numericValue,
        pr: prReport.audits[metric].numericValue,
        change: prReport.audits[metric].numericValue - baseReport.audits[metric].numericValue
      };
    }
  });
  
  fs.writeFileSync('performance-regression-report.json', JSON.stringify(comparisonReport, null, 2));
  console.log('\n📄 Regression analysis report saved to: performance-regression-report.json');
  
  if (hasRegression) {
    console.log('\n❌ Performance regression detected! Please review the changes.');
    process.exit(1);
  } else {
    console.log('\n✅ No performance regression detected.');
  }
}

// Get command line arguments
const [,, baseFile, prFile] = process.argv;

if (!baseFile || !prFile) {
  console.error('Usage: node performance-regression-check.js <base-report.json> <pr-report.json>');
  process.exit(1);
}

// Run the comparison
comparePerformance(baseFile, prFile);