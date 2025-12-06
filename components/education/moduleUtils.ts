import { EducationModule, RegionCode } from '../../types';
import { BASE_MODULES } from '../../data/educationData';
import { adaptContent } from './localization';

/**
 * Generates localized education modules based on the user's region.
 * Adapts all text content including titles, descriptions, playbook content,
 * and lesson step content.
 */
export const getLocalizedModules = (region: RegionCode): EducationModule[] => {
    return BASE_MODULES.map(mod => ({
        ...mod,
        title: adaptContent(mod.title, region),
        description: adaptContent(mod.description, region),
        playbook: mod.playbook ? {
            summary: adaptContent(mod.playbook.summary, region),
            realLifeExample: adaptContent(mod.playbook.realLifeExample, region),
            definitions: mod.playbook.definitions.map(d => ({
                term: adaptContent(d.term, region),
                definition: adaptContent(d.definition, region)
            })),
            actionableSteps: mod.playbook.actionableSteps.map(s => adaptContent(s, region))
        } : undefined,
        steps: mod.steps.map(step => ({
            ...step,
            content: adaptContent(step.content, region),
            correctAnswerExplanation: adaptContent(step.correctAnswerExplanation || '', region),
            options: step.options?.map(o => ({
                ...o,
                text: adaptContent(o.text, region),
                feedback: adaptContent(o.feedback, region)
            })),
            scenarioOptions: step.scenarioOptions?.map(o => ({
                ...o,
                text: adaptContent(o.text, region),
                feedback: adaptContent(o.feedback, region)
            })),
            connectionPairs: step.connectionPairs?.map(p => ({
                term: adaptContent(p.term, region),
                match: adaptContent(p.match, region)
            })),
            fillBlankCorrect: step.fillBlankCorrect ? adaptContent(step.fillBlankCorrect, region) : undefined,
            fillBlankOptions: step.fillBlankOptions?.map(o => adaptContent(o, region)),
            sortCorrectOrder: step.sortCorrectOrder?.map(o => adaptContent(o, region)),
            allocatorCategories: step.allocatorCategories?.map(c => ({
                ...c,
                label: adaptContent(c.label, region)
            })),
            selectorTargetPhrases: step.selectorTargetPhrases?.map(p => adaptContent(p, region)),
            // Adapt Binary Choice
            binaryLeft: step.binaryLeft ? {
                ...step.binaryLeft,
                label: adaptContent(step.binaryLeft.label, region),
                feedback: adaptContent(step.binaryLeft.feedback, region)
            } : undefined,
            binaryRight: step.binaryRight ? {
                ...step.binaryRight,
                label: adaptContent(step.binaryRight.label, region),
                feedback: adaptContent(step.binaryRight.feedback, region)
            } : undefined,
        }))
    }));
};
