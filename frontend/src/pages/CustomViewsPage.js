// CustomViewsPage — hosts the 4 "Test Views" features.
import React from 'react';
import TestCoverageChart from '../components/TestCoverageChart';
import ModulePassFailHeatmap from '../components/ModulePassFailHeatmap';
import TestReportPDF from '../components/TestReportPDF';
import GenerationRulesEditor from '../components/GenerationRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Test Views</h1>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
          Custom dashboards and tools for coverage trends, module health, exports, and generation rules.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <TestCoverageChart />
        <ModulePassFailHeatmap />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          <TestReportPDF />
          <GenerationRulesEditor />
        </div>
      </div>
    </div>
  );
}
