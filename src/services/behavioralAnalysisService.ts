import { ConnectionEdge, Entity, RawSourceRecord } from '../types';

export interface BehavioralFinding {
  title: string;
  description: string;
  evidenceRecordId?: string;
  evidenceLabel: string;
}

export interface BehavioralAnalysisResult {
  contributingFactors: BehavioralFinding[];
  protectiveFactors: BehavioralFinding[];
  rehabilitationNeeds: string[];
  recommendedInterventions: string[];
  hasDocumentedInformation: boolean;
}

const firstRecordFor = (records: RawSourceRecord[], entity: Entity) =>
  records.find(record => record.extractedEntities.includes(entity.id));

/**
 * Produces a cautious, explainable support assessment from documented case data.
 * It deliberately does not infer motives, diagnoses, or future behaviour.
 */
export const buildBehavioralAnalysis = (
  entity: Entity,
  connectedEdges: ConnectionEdge[],
  relatedRecords: RawSourceRecord[],
): BehavioralAnalysisResult => {
  const contributingFactors: BehavioralFinding[] = [];
  const protectiveFactors: BehavioralFinding[] = [];
  const rehabilitationNeeds: string[] = [];
  const recommendedInterventions: string[] = [];
  const record = firstRecordFor(relatedRecords, entity);

  if (connectedEdges.length > 0) {
    contributingFactors.push({
      title: 'Documented network association',
      description: `${connectedEdges.length} direct case link${connectedEdges.length === 1 ? '' : 's'} are recorded for this profile. This records association evidence only; it does not explain the person’s conduct.`,
      evidenceRecordId: record?.id,
      evidenceLabel: record ? `${record.recordType}: ${record.documentNumber}` : 'Recorded network links',
    });
    rehabilitationNeeds.push('Community-based support and safe disengagement planning');
    recommendedInterventions.push('Offer voluntary, case-appropriate community support and structured disengagement planning, subject to legal and safeguarding review.');
  }

  if (/prior|previous|case \(/i.test(entity.riskIndicator || '')) {
    contributingFactors.push({
      title: 'Documented prior case reference',
      description: entity.riskIndicator || 'A prior case reference appears in the profile record.',
      evidenceRecordId: record?.id,
      evidenceLabel: record ? `${record.recordType}: ${record.documentNumber}` : 'Profile record',
    });
    rehabilitationNeeds.push('Individual support and counselling assessment');
    recommendedInterventions.push('Consider referral to appropriate counselling, legal-aid, and social-support services after an individual needs assessment.');
  }

  const occupation = Object.entries(entity.metadata).find(([key]) =>
    /driver|business|occupation|employment|profession|primary business/i.test(key),
  );

  if (occupation) {
    protectiveFactors.push({
      title: 'Documented work or skill context',
      description: `${occupation[0]}: ${occupation[1]}. This is recorded as an existing capability or work context, not a finding about employability.`,
      evidenceRecordId: record?.id,
      evidenceLabel: record ? `${record.recordType}: ${record.documentNumber}` : 'Profile metadata',
    });
    rehabilitationNeeds.push('Employment and skills-support assessment');
    recommendedInterventions.push('Where appropriate and voluntary, connect the person to employment assistance or skills-recognition pathways aligned with documented experience.');
  }

  return {
    contributingFactors,
    protectiveFactors,
    rehabilitationNeeds: [...new Set(rehabilitationNeeds)],
    recommendedInterventions: [...new Set(recommendedInterventions)],
    hasDocumentedInformation: contributingFactors.length > 0 || protectiveFactors.length > 0,
  };
};
