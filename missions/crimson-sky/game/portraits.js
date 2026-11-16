// Conversation portraits: 40×48 pixel busts with expressions, drawn in code from each character's palette.
// They stand in until illustrated portraits exist. The base drawing faces right; mirror it with CSS for the right-hand speaker.
export const W = 40, H = 48;
const CAST = {
  Lucas: { hair: '#2a1a1c', hair2: '#6a3226', skin: '#e0a078', skin2: '#c8865e', shirt: '#b9b0a6', shirt2: '#2c2a4a', eye: '#3a2218', blush: '#c07a56', style: 'kid', kid: true },
  Mariana: { hair: '#2a1618', hair2: '#5e2c26', skin: '#c98e66', skin2: '#a87250', shirt: '#9a7870', shirt2: '#7a5c56', eye: '#3a2014', style: 'long', lips: '#8a3e3a', blush: '#a86c4a' },
  Kiran: { hair: '#24161e', hair2: '#8a4a2c', skin: '#c07e4c', skin2: '#9a6038', shirt: '#b08cae', shirt2: '#6a4a6c', eye: '#3a2218', glasses: '#0e0c14', style: 'short', collar: '#c8a6c6' },
  Mateo: { hair: '#2c1a16', hair2: '#7a3424', skin: '#c8865a', skin2: '#a06840', shirt: '#33484c', shirt2: '#24363a', eye: '#3a2218', style: 'curls' },
  Mercer: { hair: '#e6e2da', hair2: '#b8b4ac', skin: '#e2b294', skin2: '#c09272', shirt: '#7a6a54', shirt2: '#5a4c3c', eye: '#3a2a22', glasses: '#3a3a44', style: 'short', collar: '#d8d0c0' },
  'Lucas Almeida': { hair: '#2a1a1c', hair2: '#6a3226', skin: '#e0a078', skin2: '#c8865e', shirt: '#3a4a6a', shirt2: '#2a3650', eye: '#3a2218', style: 'short', collar: '#d8d0c8' },
  Supervisor: { hair: '#3a2a22', hair2: '#6a5a50', skin: '#a06a48', skin2: '#86563a', shirt: '#6a5a7a', shirt2: '#4e4260', eye: '#1a1420', glasses: '#1a1420', style: 'long', collar: '#e8e4ec' },
  Worker: { hair: '#2a1c18', hair2: '#3a2a22', skin: '#b07a58', skin2: '#8e5e40', shirt: '#f07a28', shirt2: '#d0642a', eye: '#1a1420', style: 'cap', cap: '#f4f0e0', cap2: '#c8c4b4', vest: '#f0f0a0' },
};
export const hasPortrait = (who) => !!(who && (CAST[who] || ART[who]));
export const NAMES = [...Object.keys(CAST), 'Rafael', 'Voss', 'Elena', 'Leila', 'Naomi']; // Rafael and Voss have illustrated busts only (no pixel bust)
// Expressions Chapter One actually uses (neutral is the fallback for all).
export const USED = {"Worker":["serious","neutral"],"Lucas":["surprised","happy","neutral"],"Mariana":["worried","neutral"],"Mateo":["worried","serious","sarcastic","smirk","thinking","neutral","happy","proud","laughing","surprised","confused","frustrated","grin"],"Kiran":["tired","playful","curious","determined","disappointed","annoyed","sarcastic","neutral","confident","thinking","realization","serious","excited","shocked"]};
export const slotId = (who, mood) => 'port-' + String(who).toLowerCase() + '-' + (mood || 'neutral');
export const MOODS = ['neutral', 'happy', 'grin', 'worried', 'surprised', 'confused', 'curious', 'sad', 'serious', 'thinking', 'smirk', 'tired',
  'confident', 'sarcastic', 'excited', 'realization', 'angry', 'annoyed', 'frightened', 'shocked', 'betrayed', 'crying', 'relief', 'determined', 'disappointed', 'amazed', 'playful',
  'laughing', 'frustrated', 'desperate', 'guilty', 'ashamed', 'conflicted', 'defiant', 'emotional', 'proud', 'urgent', 'skeptical',
  'polite', 'manipulative', 'persuasive', 'threatening', 'furious', 'bitter', 'sympathy', 'hopeful', 'reassuring', 'protective', 'unwell', 'gentle', 'stern', 'commanding', 'pressure',
  'suspicious'];

// ---- Illustrated busts (Solomon) ----
// One entry per delivered file. Key = mood used in the script; file = Solomon's filename, kept as delivered.
// Files live in film/portraits/<character>/ (resized to 820 px wide; originals in uploads/).
// To add one: drop the PNG in that folder and add a line here. Status table: handoff_the_last_field/PORTRAITS.md.
export const ART = {
  Kiran: {
    dir: 'film/portraits/kiran/',
    // batch 1
    neutral: 'Kiran_Rao_Neutral.png',
    confused: 'Kiran_Rao_Confused.png',
    curious: 'Kiran_Rao_Curious.png',
    thinking: 'Kiran_Rao_Deep_Thinking.png',
    // batch 2
    confident: 'Kiran_Rao_Confident.png',
    sarcastic: 'Kiran_Rao_Sarcastic.png',
    excited: 'Kiran_Rao_Scientific_Excitement.png',
    realization: 'Kiran_Rao_Sudden_Realization.png',
    // batch 3
    angry: 'Kiran_Rao_Angry.png',
    annoyed: 'Kiran_Rao_Annoyed.png',
    frightened: 'Kiran_Rao_Frightened.png',
    shocked: 'Kiran_Rao_Shocked.png',
    // batch 4
    betrayed: 'Kiran_Rao_Betrayed.png',
    crying: 'Kiran_Rao_Crying.png',
    tired: 'Kiran_Rao_Exhausted.png',
    sad: 'Kiran_Rao_Sad.png',
    // batch 5
    relief: 'Kiran_Rao_Emotional_Relief.png',
    determined: 'Kiran_Rao_Determined.png',
    disappointed: 'Kiran_Rao_Disappointed.png',
    happy: 'Kiran_Rao_Happy.png',
    // batch 6
    amazed: 'Kiran_Rao_Amazed.png',
    playful: 'Kiran_Rao_Playful.png',
  },
  Mateo: {
    dir: 'film/portraits/mateo/',
    neutral: 'Mateo_Reyes_Neutral.png',
    happy: 'Mateo_Reyes_Friendly_Smile.png',
    grin: 'Mateo_Reyes_Playful_Grin.png',
    sarcastic: 'Mateo_Reyes_Sarcastic.png',
    smirk: 'Mateo_Reyes_Amused.png',
    thinking: 'Mateo_Reyes_Concentrating.png',
    confused: 'Mateo_Reyes_Confused.png',
    laughing: 'Mateo_Reyes_Laughing.png',
    annoyed: 'Mateo_Reyes_Annoyed.png',
    sad: 'Mateo_Reyes_Deeply_Sad.png',
    frustrated: 'Mateo_Reyes_Frustrated.png',
    worried: 'Mateo_Reyes_Worried.png',
    desperate: 'Mateo_Reyes_Desperate.png',
    guilty: 'Mateo_Reyes_Guilty.png',
    ashamed: 'Mateo_Reyes_Ashamed.png',
    conflicted: 'Mateo_Reyes_Emotionally_Conflicted.png',
    angry: 'Mateo_Reyes_Angry.png',
    defiant: 'Mateo_Reyes_Defiant.png',
    surprised: 'Mateo_Reyes_Surprised.png',
    relief: 'Mateo_Reyes_Relieved.png',
    emotional: 'Mateo_Reyes_Emotional.png',
    proud: 'Mateo_Reyes_Proud.png',
  },
  // Rafael (night technician): 16 files, batches 1–4. Normalised to 820×760, head scaled to match Kiran/Mateo.
  Rafael: {
    dir: 'film/portraits/rafael/',
    // batch 1
    neutral: 'Rafael_Neutral.png',
    serious: 'Rafael_Attentive.png',
    confused: 'Rafael_Confused.png',
    worried: 'Rafael_Concerned.png',
    // batch 2
    frightened: 'Rafael_Alarmed.png',
    determined: 'Rafael_Determined.png',
    surprised: 'Rafael_Surprised.png',
    urgent: 'Rafael_Urgent.png',
    // batch 3
    tired: 'Rafael_Exhausted.png',
    thinking: 'Rafael_Focused.png',
    relief: 'Rafael_Relieved.png',
    skeptical: 'Rafael_Skeptical.png',
    // batch 4 (Curious is a different costume; Frustrated / Reassuring / Hopeful are cropped at the sides)
    curious: 'Rafael_Curious.png',
    frustrated: 'Rafael_Frustrated.png',
    confident: 'Rafael_Reassuring.png',
    happy: 'Rafael_Hopeful.png',
  },
  // Mariana Almeida (Lucas's mother): 12 files, batches 1–3. Normalised to 820×760.
  Mariana: {
    dir: 'film/portraits/mariana/',
    // batch 1
    neutral: 'Mariana_Almeida_Neutral.png',
    happy: 'Mariana_Almeida_Loving_Smile.png',
    confused: 'Mariana_Almeida_Confused.png',
    surprised: 'Mariana_Almeida_Startled.png',
    // batch 2
    frightened: 'Mariana_Almeida_Frightened.png',
    protective: 'Mariana_Almeida_Protective.png',
    shocked: 'Mariana_Almeida_Shocked.png',
    worried: 'Mariana_Almeida_Worried.png',
    // batch 3
    tired: 'Mariana_Almeida_Exhausted.png',
    hopeful: 'Mariana_Almeida_Hopeful.png',
    reassuring: 'Mariana_Almeida_Reassuring.png',
    relief: 'Mariana_Almeida_Relieved.png',
  },
  // Elena Reyes (Mateo's mother, Ch. 3, 9, 12): 13 files, batches 1–4. Normalised to 820×760 (sources ~650 px, upscaled).
  Elena: {
    dir: 'film/portraits/elena/',
    // batch 1
    neutral: 'Elena_Reyes_Neutral.png',
    happy: 'Elena_Reyes_Warm_Smile.png',
    playful: 'Elena_Reyes_Playful.png',
    laughing: 'Elena_Reyes_Laughing.png',
    // batch 2
    worried: 'Elena_Reyes_Worried.png',
    sad: 'Elena_Reyes_Concerned.png',
    tired: 'Elena_Reyes_Tired.png',
    unwell: 'Elena_Reyes_Physically_Unwell.png',
    // batch 3
    serious: 'Elena_Reyes_Firm.png',
    gentle: 'Elena_Reyes_Gentle.png',
    proud: 'Elena_Reyes_Proud.png',
    skeptical: 'Elena_Reyes_Suspicious.png',
    // batch 4
    emotional: 'Elena_Reyes_Emotional_Relief.png',
  },
  // Leila Haddad (commander / pilot, Ch. 3 onward): 18 files, batches 1–5. Normalised to 820×760.
  Leila: {
    dir: 'film/portraits/leila/',
    neutral: 'Leila_Haddad_Neutral.png', confident: 'Leila_Haddad_Professional.png', thinking: 'Leila_Haddad_Analytical.png', skeptical: 'Leila_Haddad_Skeptical.png',
    angry: 'Leila_Haddad_Angry.png', annoyed: 'Leila_Haddad_Annoyed.png', disappointed: 'Leila_Haddad_Disapproving.png', stern: 'Leila_Haddad_Stern.png',
    frightened: 'Leila_Haddad_Alarmed.png', commanding: 'Leila_Haddad_Commanding.png', worried: 'Leila_Haddad_Concerned.png', protective: 'Leila_Haddad_Protective.png',
    pressure: 'Leila_Haddad_Under_Pressure.png', determined: 'Leila_Haddad_Determined.png', smirk: 'Leila_Haddad_Dryly_Amused.png', happy: 'Leila_Haddad_Warm_Smile.png',
    proud: 'Leila_Haddad_Proud.png', relief: 'Leila_Haddad_Relieved.png',
  },
  // Adrian Voss (Aegis CEO, from Ch. 5): 20 files, batches 1–5. Normalised to 820×760.
  Voss: {
    dir: 'film/portraits/voss/',
    // batch 1
    neutral: 'Adrian_Voss_Neutral.png',
    happy: 'Adrian_Voss_Charming_Smile.png',
    confident: 'Adrian_Voss_Public_Confidence.png',
    polite: 'Adrian_Voss_Polite.png',
    // batch 2
    thinking: 'Adrian_Voss_Calculating.png',
    sarcastic: 'Adrian_Voss_Condescending.png',
    manipulative: 'Adrian_Voss_Manipulative.png',
    smirk: 'Adrian_Voss_Smug.png',
    // batch 3 (different lapel pin and suit; Cold and Displeased keep pieces of the old background)
    serious: 'Adrian_Voss_Cold.png',
    annoyed: 'Adrian_Voss_Displeased.png',
    persuasive: 'Adrian_Voss_Persuasive.png',
    skeptical: 'Adrian_Voss_Suspicious.png',
    // batch 4 (red waistcoat, different pin; Surprised is a different rendering style)
    angry: 'Adrian_Voss_Angry.png',
    furious: 'Adrian_Voss_Furious.png',
    surprised: 'Adrian_Voss_Surprised.png',
    threatening: 'Adrian_Voss_Threatening.png',
    // batch 5
    bitter: 'Adrian_Voss_Bitter.png',
    sad: 'Adrian_Voss_Defeated.png',
    tired: 'Adrian_Voss_Exhausted.png',
    sympathy: 'Adrian_Voss_False_Sympathy.png',
  },
  // Naomi Chen (director, from Ch. 3): 18 files, batches 1–5. Normalised to 820×760.
  Naomi: {
    dir: 'film/portraits/naomi/',
    neutral: 'Naomi_Chen_Neutral.png', thinking: 'Naomi_Chen_Analytical.png', happy: 'Naomi_Chen_Professional_Smile.png', serious: 'Naomi_Chen_Serious.png',
    annoyed: 'Naomi_Chen_Annoyed.png', disappointed: 'Naomi_Chen_Disappointed.png', skeptical: 'Naomi_Chen_Skeptical.png', sarcastic: 'Naomi_Chen_Unimpressed.png',
    angry: 'Naomi_Chen_Cold_Anger.png', commanding: 'Naomi_Chen_Commanding.png', frustrated: 'Naomi_Chen_Frustrated.png', suspicious: 'Naomi_Chen_Suspicious.png',
    gentle: 'Naomi_Chen_Compassionate.png', determined: 'Naomi_Chen_Determined.png', reassuring: 'Naomi_Chen_Reassuring.png', worried: 'Naomi_Chen_Worried.png',
    proud: 'Naomi_Chen_Proud.png', relief: 'Naomi_Chen_Relieved.png',
  },
  // Professor Elias Mercer (Geneva chairman, Ch. 2): 6 files, one batch (15 Nov 2026). 820×760, scale 0.58, top-aligned.
  Mercer: {
    dir: 'film/portraits/mercer/',
    neutral: 'Elias_Mercer_Neutral.png', tired: 'Elias_Mercer_Weary.png', serious: 'Elias_Mercer_Serious.png',
    curious: 'Elias_Mercer_Curious.png', happy: 'Elias_Mercer_Faint_Smile.png', surprised: 'Elias_Mercer_Surprised.png',
  },
  // Lucas Almeida (child, Prologue · Ch. 1 · Ch. 21/26): 12 files, one batch (15 Nov 2026). 820×760, one uniform scale, bottom-aligned (a child's head, smaller than the adults').
  Lucas: {
    dir: 'film/portraits/lucas/',
    neutral: 'Lucas_Almeida_Neutral.png', happy: 'Lucas_Almeida_Innocent_Smile.png', excited: 'Lucas_Almeida_Excited.png', curious: 'Lucas_Almeida_Curious.png',
    confused: 'Lucas_Almeida_Confused.png', frightened: 'Lucas_Almeida_Frightened.png', sad: 'Lucas_Almeida_Sad.png', surprised: 'Lucas_Almeida_Surprised.png',
    amazed: 'Lucas_Almeida_Amazed.png', determined: 'Lucas_Almeida_Determined.png', hopeful: 'Lucas_Almeida_Hopeful.png', realization: 'Lucas_Almeida_Scientific_Discovery.png',
  },
};
// Kiran and Mateo are final: Solomon will not draw more expressions for them (Nov 2026).
// Every mood they lack is filled here with the closest drawing they do have, so no line ever falls back to a pixel bust.
export const ALIAS = {
  Mercer: { thinking: 'curious', skeptical: 'curious', smirk: 'happy', grin: 'happy', relief: 'happy', confident: 'serious', determined: 'serious', worried: 'tired', sad: 'tired', shocked: 'surprised', amazed: 'surprised', realization: 'surprised' },
  Lucas: { grin: 'excited', laughing: 'excited', playful: 'happy', smirk: 'happy', proud: 'realization', shocked: 'surprised', worried: 'frightened', desperate: 'frightened',
    crying: 'sad', disappointed: 'sad', guilty: 'sad', ashamed: 'sad', tired: 'sad', thinking: 'curious', serious: 'determined', defiant: 'determined', angry: 'determined',
    frustrated: 'confused', skeptical: 'confused', relief: 'hopeful', emotional: 'hopeful', reassuring: 'happy', confident: 'determined', gentle: 'happy' },
  Kiran: { grin: 'happy', worried: 'confused', surprised: 'realization', serious: 'determined', smirk: 'sarcastic', laughing: 'playful', frustrated: 'annoyed',
    desperate: 'frightened', guilty: 'sad', ashamed: 'sad', conflicted: 'thinking', defiant: 'determined', emotional: 'relief', proud: 'confident', urgent: 'determined', skeptical: 'sarcastic' },
  Mateo: { curious: 'thinking', serious: 'defiant', tired: 'guilty', confident: 'proud', excited: 'grin', realization: 'surprised', frightened: 'desperate',
    shocked: 'surprised', betrayed: 'angry', crying: 'emotional', determined: 'defiant', disappointed: 'sad', amazed: 'surprised', playful: 'grin', urgent: 'worried', skeptical: 'sarcastic' },
  Rafael: { grin: 'happy', sad: 'worried', smirk: 'skeptical', sarcastic: 'skeptical', excited: 'surprised', realization: 'surprised', angry: 'frustrated', annoyed: 'skeptical', shocked: 'frightened',
    betrayed: 'frustrated', crying: 'worried', disappointed: 'tired', amazed: 'surprised', playful: 'happy', laughing: 'happy', desperate: 'urgent', guilty: 'worried', ashamed: 'worried',
    conflicted: 'thinking', defiant: 'determined', emotional: 'relief', proud: 'confident', hopeful: 'happy', reassuring: 'confident' },
  Mariana: { grin: 'happy', smirk: 'reassuring', playful: 'happy', laughing: 'happy', proud: 'happy', confident: 'reassuring', curious: 'confused', thinking: 'neutral',
    serious: 'protective', determined: 'protective', defiant: 'protective', angry: 'protective', annoyed: 'protective', frustrated: 'protective',
    sad: 'tired', disappointed: 'tired', crying: 'frightened', desperate: 'frightened', realization: 'surprised', amazed: 'hopeful', excited: 'hopeful', emotional: 'relief' },
  Elena: { grin: 'laughing', smirk: 'playful', sarcastic: 'skeptical', annoyed: 'skeptical', curious: 'gentle', thinking: 'neutral', confident: 'proud', reassuring: 'gentle',
    hopeful: 'gentle', relief: 'emotional', crying: 'emotional', determined: 'serious', defiant: 'serious', protective: 'serious', angry: 'serious', frustrated: 'skeptical',
    confused: 'worried', surprised: 'worried', shocked: 'worried', frightened: 'worried', desperate: 'worried', disappointed: 'sad', conflicted: 'sad', guilty: 'sad', ashamed: 'sad',
    excited: 'happy', amazed: 'happy', realization: 'worried' },
  Leila: { serious: 'stern', sarcastic: 'smirk', playful: 'smirk', grin: 'happy', laughing: 'happy', curious: 'thinking', confused: 'skeptical', surprised: 'frightened',
    shocked: 'frightened', realization: 'frightened', amazed: 'relief', excited: 'happy', urgent: 'commanding', defiant: 'determined', frustrated: 'annoyed', furious: 'angry',
    tired: 'pressure', desperate: 'pressure', sad: 'worried', guilty: 'worried', ashamed: 'worried', conflicted: 'thinking', emotional: 'relief', hopeful: 'relief',
    reassuring: 'happy', betrayed: 'angry', crying: 'worried', threatening: 'stern' },
  Voss: { grin: 'happy', worried: 'skeptical', confused: 'skeptical', curious: 'thinking', excited: 'confident', realization: 'surprised', shocked: 'surprised', amazed: 'surprised',
    frightened: 'surprised', betrayed: 'bitter', crying: 'sad', relief: 'sympathy', determined: 'serious', disappointed: 'sad', playful: 'smirk', laughing: 'happy',
    frustrated: 'annoyed', desperate: 'bitter', guilty: 'sad', ashamed: 'sad', conflicted: 'thinking', defiant: 'threatening', emotional: 'sad', proud: 'confident', urgent: 'serious' },
  Naomi: { grin: 'happy', confident: 'commanding', curious: 'thinking', confused: 'skeptical', surprised: 'worried', realization: 'thinking', shocked: 'worried', amazed: 'happy',
    frightened: 'worried', betrayed: 'angry', crying: 'gentle', sad: 'disappointed', tired: 'frustrated', excited: 'proud', playful: 'happy', laughing: 'happy', smirk: 'sarcastic',
    desperate: 'worried', stern: 'serious', urgent: 'commanding', pressure: 'frustrated', protective: 'determined', hopeful: 'reassuring', emotional: 'relief', defiant: 'determined', furious: 'angry' },
};
Object.keys(ALIAS).forEach((who) => Object.entries(ALIAS[who]).forEach(([mood, src]) => { if (ART[who] && !ART[who][mood] && ART[who][src]) ART[who][mood] = ART[who][src]; }));
// When a mood has no drawing yet, try these in order (then neutral).
export const FALLBACK = {
  serious: ['determined', 'defiant', 'thinking'], worried: ['frightened', 'confused', 'thinking'], surprised: ['shocked', 'amazed', 'confused', 'curious'], tired: ['frustrated', 'sad', 'thinking'],
  sad: ['disappointed', 'worried', 'thinking'], smirk: ['sarcastic', 'playful', 'curious'], happy: ['grin', 'relief', 'curious'], grin: ['happy', 'playful'],
  confused: ['worried', 'surprised'], curious: ['surprised'],
  confident: ['determined', 'smirk'], sarcastic: ['smirk', 'playful'], excited: ['amazed', 'happy', 'grin'], realization: ['shocked', 'surprised', 'amazed'],
  angry: ['annoyed', 'serious'], annoyed: ['angry', 'serious'], frightened: ['worried', 'shocked'], shocked: ['surprised', 'frightened'],
  betrayed: ['sad', 'angry'], crying: ['sad', 'betrayed'], relief: ['happy', 'crying'], determined: ['confident', 'serious'],
  disappointed: ['sad', 'tired'], amazed: ['excited', 'surprised'], playful: ['smirk', 'grin', 'happy'],
  laughing: ['grin', 'happy'], frustrated: ['annoyed', 'angry'], desperate: ['worried', 'frightened'], guilty: ['ashamed', 'sad'], ashamed: ['guilty', 'sad'],
  conflicted: ['guilty', 'worried'], defiant: ['determined', 'angry'], emotional: ['relief', 'crying', 'sad'], proud: ['confident', 'happy'],
  urgent: ['desperate', 'worried', 'serious'], skeptical: ['sarcastic', 'annoyed', 'confused'],
  polite: ['happy', 'confident'], manipulative: ['smirk', 'sarcastic', 'thinking'], persuasive: ['confident', 'determined'], threatening: ['angry', 'serious', 'defiant'],
  furious: ['angry', 'frustrated', 'annoyed'], bitter: ['disappointed', 'annoyed', 'sad'], sympathy: ['relief', 'happy', 'sad'],
  hopeful: ['relief', 'happy', 'amazed'], reassuring: ['confident', 'happy', 'relief'], protective: ['determined', 'serious', 'worried'],
  unwell: ['tired', 'sad', 'worried'], stern: ['serious', 'angry'], commanding: ['determined', 'serious'], pressure: ['tired', 'worried', 'serious'], gentle: ['reassuring', 'happy', 'relief'],
  suspicious: ['skeptical', 'serious'],
};
// Returns { src, mood } for the best delivered bust, or null if the character has none.
export function artFor(who, mood = 'neutral') {
  const a = ART[who]; if (!a) return null;
  const order = [mood, ...(FALLBACK[mood] || []), 'neutral'];
  for (const m of order) if (a[m]) return { src: a.dir + a[m], mood: m, exact: m === mood };
  return null;
}
const FACE = {
  neutral: { eyes: 'open', brows: 'flat', mouth: 'line' },
  happy: { eyes: 'arc', brows: 'flat', mouth: 'smile', blush: true },
  grin: { eyes: 'open', brows: 'up', mouth: 'grin' },
  worried: { eyes: 'open', brows: 'worry', mouth: 'wavy', sweat: true },
  surprised: { eyes: 'wide', brows: 'high', mouth: 'o' },
  sad: { eyes: 'lid', brows: 'worry', mouth: 'frown' },
  serious: { eyes: 'lid', brows: 'angry', mouth: 'flat' },
  thinking: { eyes: 'side', brows: 'quirk', mouth: 'side' },
  confused: { eyes: 'side', brows: 'worry', mouth: 'wavy' },
  curious: { eyes: 'open', brows: 'up', mouth: 'line' },
  smirk: { eyes: 'lid', brows: 'quirk', mouth: 'smirk' },
  tired: { eyes: 'lid', brows: 'flat', mouth: 'flat', bags: true },
};
const BROWS = {
  flat: [[17, 17, 17, 17], [17, 17, 17, 17]], up: [[16, 16, 16, 16], [16, 16, 16, 16]], high: [[15, 15, 15, 15], [15, 15, 15, 15]],
  worry: [[18, 17, 17, 16], [16, 17, 17, 18]], angry: [[16, 17, 17, 18], [18, 17, 17, 16]], quirk: [[17, 17, 17, 17], [16, 15, 15, 16]],
};
export function drawPortrait(cv, who, mood = 'neutral', o = {}) {
  const p = CAST[who]; if (!p || !cv) return;
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const g = cv.getContext('2d'); g.clearRect(0, 0, W, H);
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const f = FACE[mood] || FACE.neutral, h = p.hair, h2 = p.hair2, sk = p.skin, sk2 = p.skin2, white = '#f6f1ea', dark = p.lips || '#4a1e22';
  if (p.style === 'long') { R(8, 9, 24, 32, h); R(7, 14, 1, 26, h); R(32, 14, 1, 26, h); }
  // body + neck
  if (p.kid) { R(9, 41, 22, 7, p.shirt); R(7, 43, 26, 5, p.shirt); R(7, 46, 26, 2, p.shirt2); R(13, 43, 1, 5, p.shirt2); R(26, 43, 1, 5, p.shirt2); }
  else { R(7, 40, 26, 8, p.shirt); R(5, 42, 30, 6, p.shirt); R(5, 46, 30, 2, p.shirt2); R(12, 42, 1, 6, p.shirt2); R(27, 42, 1, 6, p.shirt2); }
  if (p.vest) { R(5, 44, 30, 2, p.vest); R(13, 40, 2, 8, p.vest); R(25, 40, 2, 8, p.vest); }
  R(17, 33, 6, 6, sk); R(17, 33, 6, 2, sk2);
  if (p.collar) { R(14, 38, 5, 3, p.collar); R(21, 38, 5, 3, p.collar); } else R(16, 38, 8, 2, p.shirt2);
  // head
  R(12, 12, 16, 21, sk); R(11, 14, 18, 16, sk); R(13, 33, 14, 1, sk); R(15, 34, 10, 1, sk);
  R(9, 19, 2, 5, sk); R(29, 19, 2, 5, sk); R(10, 20, 1, 3, sk2); R(29, 20, 1, 3, sk2); R(11, 26, 1, 4, sk2);
  R(21, 24, 1, 2, sk2); R(20, 26, 2, 1, sk2);
  // hair
  if (p.style === 'curls') {
    R(10, 7, 20, 7, h); R(8, 8, 2, 6, h); R(30, 8, 2, 6, h); R(11, 5, 3, 2, h); R(16, 4, 4, 3, h); R(22, 5, 4, 2, h); R(27, 6, 2, 1, h);
    R(9, 12, 2, 9, h); R(29, 12, 2, 7, h); R(12, 13, 3, 2, h); R(16, 13, 3, 3, h); R(21, 13, 3, 2, h); R(25, 13, 3, 2, h);
    [[13, 8], [17, 5], [22, 8], [26, 9], [10, 10]].forEach(([x, y]) => R(x, y, 1, 1, h2));
  } else if (p.style === 'cap') {
    R(10, 13, 2, 7, h); R(28, 13, 2, 5, h);
    R(11, 7, 18, 6, p.cap); R(10, 9, 20, 4, p.cap); R(12, 12, 21, 2, p.cap2); R(18, 8, 4, 2, p.shirt);
  } else {
    R(11, 7, 18, 6, h); R(10, 9, 20, 5, h);
    if (p.style === 'kid') { R(10, 13, 2, 6, h); R(28, 13, 2, 5, h); R(12, 13, 3, 3, h); R(15, 13, 3, 2, h); R(19, 13, 3, 3, h); R(23, 13, 3, 2, h); R(26, 13, 2, 3, h); R(19, 5, 2, 2, h); }
    else if (p.style === 'long') { R(12, 13, 8, 2, h); R(12, 15, 4, 1, h); R(23, 13, 5, 1, h); R(9, 13, 3, 24, h); R(28, 13, 3, 24, h); R(7, 37, 5, 7, h); R(28, 37, 5, 7, h); }
    else { R(10, 13, 2, 8, h); R(28, 13, 2, 6, h); R(12, 13, 6, 2, h); R(12, 15, 3, 1, h); R(18, 13, 4, 1, h); R(22, 13, 6, 2, h); R(26, 15, 2, 1, h); }
    R(14, 8, 6, 1, h2); R(13, 9, 2, 1, h2);
  }
  // eyes
  const EY = 20, EX = [14, 22];
  EX.forEach((x) => {
    if (o.blink && f.eyes !== 'arc') { R(x, EY + 1, 4, 1, p.eye); return; }
    if (f.eyes === 'arc') { R(x, EY + 1, 1, 1, p.eye); R(x + 1, EY, 2, 1, p.eye); R(x + 3, EY + 1, 1, 1, p.eye); }
    else if (f.eyes === 'wide') { R(x, EY - 1, 4, 4, white); R(x + 1, EY, 2, 2, p.eye); }
    else if (f.eyes === 'lid') { R(x, EY, 4, 1, p.eye); R(x, EY + 1, 4, 2, white); R(x + 2, EY + 1, 2, 2, p.eye); }
    else if (f.eyes === 'side') { R(x, EY - 1, 4, 1, p.eye); R(x, EY, 4, 3, white); R(x + 2, EY, 2, 2, p.eye); R(x + 3, EY, 1, 1, white); }
    else { R(x, EY - 1, 4, 1, p.eye); R(x, EY, 4, 3, white); R(x + 2, EY, 2, 3, p.eye); R(x + 2, EY, 1, 1, white); }
  });
  const bc = p.brow || h, br = BROWS[f.brows] || BROWS.flat;
  EX.forEach((x, i) => br[i].forEach((y, k) => R(x + k, y, 1, 1, bc)));
  if (f.bags) { R(14, 23, 4, 1, sk2); R(22, 23, 4, 1, sk2); }
  if (f.blush || p.blush) { const b = p.blush || '#e0806e'; R(13, 25, 2, 1, b); R(25, 25, 2, 1, b); }
  // mouth (alternates with an open shape while the line is typing)
  let m = f.mouth; if (o.talk) m = m === 'grin' || m === 'smile' ? 'grin' : m === 'o' ? 'o' : 'open';
  const M = {
    line: () => R(18, 28, 4, 1, dark),
    smile: () => { R(17, 27, 1, 1, dark); R(18, 28, 4, 1, dark); R(22, 27, 1, 1, dark); },
    grin: () => { R(17, 27, 6, 2, dark); R(18, 27, 4, 1, white); R(18, 29, 4, 1, dark); },
    wavy: () => { R(17, 29, 1, 1, dark); R(18, 28, 2, 1, dark); R(20, 29, 2, 1, dark); R(22, 28, 1, 1, dark); },
    o: () => { R(19, 27, 3, 3, dark); R(20, 28, 1, 1, '#a04048'); },
    frown: () => { R(17, 29, 1, 1, dark); R(18, 28, 4, 1, dark); R(22, 29, 1, 1, dark); },
    flat: () => R(19, 28, 3, 1, dark),
    side: () => R(20, 28, 3, 1, dark),
    smirk: () => { R(18, 28, 3, 1, dark); R(21, 27, 2, 1, dark); },
    open: () => { R(18, 27, 4, 3, dark); R(19, 29, 2, 1, '#b84a52'); },
  };
  (M[m] || M.line)();
  if (p.glasses) { const c = p.glasses; EX.forEach((x) => { R(x - 1, 19, 6, 1, c); R(x - 1, 23, 6, 1, c); R(x - 1, 19, 1, 5, c); R(x + 4, 19, 1, 5, c); }); R(19, 20, 2, 1, c); R(11, 20, 2, 1, c); R(27, 20, 2, 1, c); }
  if (f.sweat) { const s = '#cfe8ff'; R(31, 13, 1, 1, s); R(30, 14, 3, 2, s); R(31, 16, 1, 1, s); }
  // 1px outline around the silhouette
  const id = g.getImageData(0, 0, W, H), d = id.data, A = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0, out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!A(x, y) && (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1))) out.push([x, y]);
  g.fillStyle = '#120e18'; out.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
}
