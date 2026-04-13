import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0F1117", surface: "#181C26", card: "#1E2330", border: "#2A3045",
  accent: "#4ECDC4", warn: "#FF6B6B", gold: "#FFD166", text: "#E8ECF0",
  muted: "#7A8599", green: "#06D6A0", purple: "#A78BFA",
};

// ── DATA ─────────────────────────────────────────────────────────────────────

const REGIONS = [
  { id: "cervical",  label: "Neck / Cervical", color: "#4ECDC4" },
  { id: "thoracic",  label: "Upper Back",      color: "#06D6A0" },
  { id: "lumbar",    label: "Lower Back",       color: "#FFD166" },
  { id: "hips",      label: "Hips & Pelvis",   color: "#FF9F1C" },
  { id: "shoulders", label: "Shoulders",        color: "#FF6B6B" },
];

const POSTURE_ISSUES = [
  { id: "fhp",      label: "Forward Head Posture",  regions: ["cervical","thoracic"] },
  { id: "kyphosis", label: "Thoracic Kyphosis",     regions: ["thoracic","shoulders"] },
  { id: "lordosis", label: "Lumbar Hyperlordosis",  regions: ["lumbar","hips"] },
  { id: "apt",      label: "Anterior Pelvic Tilt",  regions: ["lumbar","hips"] },
  { id: "ppt",      label: "Posterior Pelvic Tilt", regions: ["lumbar","hips"] },
  { id: "rounded",  label: "Rounded Shoulders",     regions: ["thoracic","shoulders"] },
  { id: "flatback", label: "Flat Back Syndrome",     regions: ["lumbar","thoracic"] },
];

const EXERCISES = {
  cervical: [
    { id:"c1", name:"Chin Tucks",                   sets:"3×10",      hold:"5s",  cue:"Gently retract chin as if making a 'double chin'. Lengthens suboccipitals and activates deep neck flexors.", difficulty:"Beginner" },
    { id:"c2", name:"Neck Side Stretch",             sets:"2×30s",     hold:"30s", cue:"Tilt ear to shoulder, use hand for gentle overpressure. Targets SCM and scalenes.", difficulty:"Beginner" },
    { id:"c3", name:"Upper Trap Stretch",            sets:"2×30s",     hold:"30s", cue:"Rotate head 45° then tilt. Deactivates overactive upper traps that pull shoulder girdle up.", difficulty:"Beginner" },
    { id:"c4", name:"Deep Neck Flexor Activation",   sets:"3×8",       hold:"10s", cue:"Nod slowly while keeping chin tucked. Critical for countering forward head posture.", difficulty:"Intermediate" },
  ],
  thoracic: [
    { id:"t1", name:"Thoracic Extension on Foam Roller", sets:"2×10",    hold:"3s", cue:"Segment by segment extension. Opens anterior chest and reverses kyphotic curve.", difficulty:"Beginner" },
    { id:"t2", name:"Cat-Cow Mobility",              sets:"3×10",      hold:"—",   cue:"Full spinal articulation — synchronize with breath. Flex/extend through each thoracic segment.", difficulty:"Beginner" },
    { id:"t3", name:"Thoracic Rotation (Seated)",    sets:"3×10/side", hold:"2s",  cue:"Cross arms, rotate from mid-back not lumbar. Restores rotational ROM lost from desk posture.", difficulty:"Beginner" },
    { id:"t4", name:"Prone Y-T-W",                   sets:"3×10 each", hold:"2s",  cue:"Lie prone, form letters with arms. Activates lower trapezius and posterior rotator cuff.", difficulty:"Intermediate" },
    { id:"t5", name:"Band Pull-Apart",               sets:"3×15",      hold:"—",   cue:"Retract scapulae at end range. Counteracts protracted shoulders from typing/phone use.", difficulty:"Beginner" },
  ],
  lumbar: [
    { id:"l1", name:"90/90 Hip Flexor Stretch",      sets:"2×45s/side", hold:"45s", cue:"Posterior pelvic tilt maintained throughout. Targets iliopsoas — key driver of lumbar hyperlordosis.", difficulty:"Beginner" },
    { id:"l2", name:"Dead Bug",                      sets:"3×8/side",  hold:"—",   cue:"Lower limbs contralaterally while pressing lumbar flat. Core stability without spinal loading.", difficulty:"Intermediate" },
    { id:"l3", name:"Bird Dog",                      sets:"3×10/side", hold:"3s",  cue:"Extend opposite arm/leg. Trains multifidus and gluteus maximus coordination.", difficulty:"Intermediate" },
    { id:"l4", name:"McGill Curl-Up",                sets:"3×6",       hold:"8s",  cue:"One knee bent, hands under lumbar. Activates rectus abdominis with minimal spinal flexion stress.", difficulty:"Beginner" },
    { id:"l5", name:"Glute Bridge",                  sets:"3×12",      hold:"2s",  cue:"Drive through heels, squeeze glutes at top. Inhibits overactive hip flexors and activates posterior chain.", difficulty:"Beginner" },
  ],
  hips: [
    { id:"h1", name:"Pigeon Stretch",                sets:"2×60s/side", hold:"60s", cue:"Square hips, sink toward floor. Releases piriformis and external rotators causing SI joint dysfunction.", difficulty:"Intermediate" },
    { id:"h2", name:"Clamshell",                     sets:"3×15/side", hold:"2s",  cue:"Band above knees, keep pelvis still. Isolates gluteus medius — critical for lateral pelvic stability.", difficulty:"Beginner" },
    { id:"h3", name:"Side-Lying Hip Abduction",      sets:"3×12/side", hold:"—",   cue:"Toes slightly down, lead with heel. Strengthens glute med to prevent Trendelenburg gait.", difficulty:"Beginner" },
    { id:"h4", name:"Deep Squat Hold",               sets:"3×30s",     hold:"30s", cue:"Heels down, chest up, knees out. Assesses and improves hip mobility, ankle dorsiflexion, thoracic extension.", difficulty:"Intermediate" },
  ],
  shoulders: [
    { id:"s1", name:"Doorway Pec Stretch",           sets:"2×30s each angle", hold:"30s", cue:"Three angles: low, mid, high. Systematically releases pec major, pec minor, and anterior deltoid.", difficulty:"Beginner" },
    { id:"s2", name:"Sleeper Stretch",               sets:"2×30s/side", hold:"30s", cue:"Side-lying, use top arm to gently press wrist down. Targets posterior capsule tightness.", difficulty:"Beginner" },
    { id:"s3", name:"Wall Angels",                   sets:"3×10",      hold:"2s at top", cue:"Flatten lumbar and cervical spine against wall throughout. Integrates scapular control with thoracic extension.", difficulty:"Intermediate" },
    { id:"s4", name:"External Rotation with Band",   sets:"3×15/side", hold:"2s",  cue:"Elbow at 90°, rotate out. Strengthens infraspinatus and teres minor — common weak links in rotator cuff.", difficulty:"Beginner" },
  ],
};

// ── MASSAGE DATA ──────────────────────────────────────────────────────────────

const SYMPTOM_MAP = [
  { symptom: "Headache / Base of skull", sources: ["cervical"], muscles: ["Suboccipitals","Upper Trapezius","SCM"] },
  { symptom: "Neck stiffness / turning", sources: ["cervical","shoulders"], muscles: ["Levator Scapulae","SCM","Scalenes"] },
  { symptom: "Upper back ache",          sources: ["thoracic","shoulders"], muscles: ["Rhomboids","Middle Trapezius","Serratus Anterior"] },
  { symptom: "Between shoulder blades",  sources: ["thoracic","shoulders"], muscles: ["Rhomboids","Infraspinatus","Subscapularis"] },
  { symptom: "Lower back pain",          sources: ["lumbar","hips"],        muscles: ["QL","Iliopsoas","Piriformis","Gluteus Medius"] },
  { symptom: "Hip / Glute pain",         sources: ["hips"],                 muscles: ["Piriformis","Gluteus Medius","TFL","Hip Flexors"] },
  { symptom: "Sacrum / SI joint",        sources: ["lumbar","hips"],        muscles: ["QL","Piriformis","Multifidus"] },
  { symptom: "Shoulder front pain",      sources: ["shoulders","thoracic"], muscles: ["Pec Minor","Anterior Deltoid","Biceps Tendon"] },
  { symptom: "Shoulder rear pain",       sources: ["shoulders"],            muscles: ["Infraspinatus","Teres Minor","Posterior Deltoid"] },
  { symptom: "Chest tightness",          sources: ["thoracic","shoulders"], muscles: ["Pec Major","Pec Minor","Intercostals"] },
];

const MUSCLES = {
  // CERVICAL
  "Suboccipitals": {
    region: "cervical",
    tpLocations: ["Base of skull, 1–2 cm lateral to midline on each side"],
    referral: "Headache wrapping over skull, behind eyes",
    tools: {
      hands: { steps: ["Sit or lie back. Place fingertips at the base of your skull.", "Find the small indentations 1–2 cm from center.", "Apply firm upward pressure — 6–7/10 intensity.", "Hold 90 seconds, breathe slowly. Release and repeat 2×."], pinPoint: "Fingertips pressing up into skull base" },
      lacrosse: { steps: ["Lie on your back. Place lacrosse ball at skull base on one side.", "Let head weight create the pressure — do not push.", "Micro-nod 'yes' slowly 5×, then hold still 60s.", "Roll to other side and repeat."], pinPoint: "Ball between skull and floor at occiput" },
      foam: { steps: ["Not ideal — too large. Use lacrosse ball or hands instead.", "If using foam roller: cradle head, roll upper neck only.", "Stay 1–2 cm from midline to find suboccipital groove."], pinPoint: "Upper cervical, just below skull" },
    },
    stretch: { name: "Chin Tuck + Neck Flexion", cue: "After releasing: tuck chin firmly, then gently nod head forward. Hold 20s × 3." },
    followUp: ["c1", "c4"],
  },
  "Upper Trapezius": {
    region: "cervical",
    tpLocations: ["Midpoint of the upper trap — grab the muscle between shoulder and neck"],
    referral: "Temple headache, side of neck, top of shoulder",
    tools: {
      hands: { steps: ["Reach opposite hand across to pinch upper trap muscle.", "Find the thickest part — usually mid-way between neck and shoulder.", "Pinch with thumb below, fingers on top. Hold 60–90s at 6/10.", "While holding: slowly tilt ear away from pinched side (pin & stretch)."], pinPoint: "Pinch grip on upper trap belly" },
      lacrosse: { steps: ["Stand facing a wall or use a doorframe.", "Place ball between upper trap and wall.", "Lean into the ball to load pressure.", "Hold tender spot 60s, then slowly tilt ear away for pin & stretch."], pinPoint: "Ball between trap and wall/doorframe" },
      foam: { steps: ["Lie on side, foam roller under the upper trap region.", "Use body weight to sink into roller.", "Small tilts of head create movement through the tissue.", "30–60s per tender zone."], pinPoint: "Side-lying on roller at upper trap" },
    },
    stretch: { name: "Upper Trap Stretch", cue: "Tilt ear to shoulder, chin slightly down, use hand on top of head for gentle overpressure. 30s × 3." },
    followUp: ["c2","c3"],
  },
  "Levator Scapulae": {
    region: "cervical",
    tpLocations: ["Angle of neck where it meets shoulder blade — top inner corner of scapula"],
    referral: "Stiff neck, unable to rotate, ache from neck to shoulder blade",
    tools: {
      hands: { steps: ["Reach across and place fingers on top inner corner of opposite shoulder blade.", "Press down and in toward the bone at moderate pressure.", "Hold 90s while slowly rotating chin toward the same shoulder (pin & stretch).", "Repeat other side."], pinPoint: "Fingertips at superior medial scapula angle" },
      lacrosse: { steps: ["Stand with ball between shoulder blade top-inner corner and wall.", "Feet 12\" from wall, knees slightly bent to control depth.", "Hold tender spot 60s, then slowly rotate head toward same side.", "This is a powerful release — go slow."], pinPoint: "Ball at superior medial scapula / wall" },
      foam: { steps: ["Foam roller is too imprecise for levator — use lacrosse ball or hands for best results."], pinPoint: "N/A — lacrosse ball preferred" },
    },
    stretch: { name: "Levator Scapulae Stretch", cue: "Hand behind back on affected side. Tilt chin to opposite armpit. Gently pull with free hand. 30s × 3." },
    followUp: ["c2","c3"],
  },
  // THORACIC
  "Rhomboids": {
    region: "thoracic",
    tpLocations: ["Between the spine and inner edge of shoulder blade — squeeze shoulder blades to find it"],
    referral: "Burning between shoulder blades, superficial ache mid-back",
    tools: {
      hands: { steps: ["Difficult to self-treat with hands alone.", "Cross arms over chest to wing out shoulder blades.", "Use fingertips to reach between spine and blade if flexible enough.", "Press and hold tender points 60s."], pinPoint: "Medial border of scapula, 2–4 cm from spine" },
      lacrosse: { steps: ["Place ball between inner shoulder blade and spine against a wall.", "Cross arm across chest to protract blade and expose rhomboids.", "Hold tender spots 60–90s.", "While holding: slowly reach arm forward (protract scapula) for pin & stretch."], pinPoint: "Ball between medial scapula and spine" },
      foam: { steps: ["Lie on back, roller perpendicular to spine under mid-back.", "Arms crossed on chest.", "Tilt slightly to one side to load rhomboid area.", "Pause on tender spots 30–60s."], pinPoint: "Foam roller mid-thoracic, tilted to rhomboid side" },
    },
    stretch: { name: "Seated Thoracic Rotation", cue: "Cross arms on chest, rotate toward affected side leading with elbow. 10 reps then hold 20s." },
    followUp: ["t3","t5"],
  },
  "Infraspinatus": {
    region: "thoracic",
    tpLocations: ["Fleshy center of the shoulder blade, below the spine of scapula"],
    referral: "Deep front shoulder pain, outer arm, 'frozen' feeling",
    tools: {
      hands: { steps: ["Reach opposite hand to outer edge of shoulder blade.", "Press fingers into the fleshy area below the blade spine.", "Hold 6–7/10 pressure 90s.", "Pin & stretch: while holding, slowly bring arm across body (horizontal adduction)."], pinPoint: "Fingers pressing into infraspinous fossa" },
      lacrosse: { steps: ["Place ball between shoulder blade center and wall.", "Step into wall to increase pressure.", "Keep elbow slightly bent — slowly move arm up/down for active release.", "Pause on painful spots 60s."], pinPoint: "Ball on mid-scapula body" },
      foam: { steps: ["Lie on back, roller across mid-thoracic.", "Tilt onto one side to load the shoulder blade area.", "Move arm in slow arcs while lying on roller for active tissue release."], pinPoint: "Foam roller mid-back, tilted to blade side" },
    },
    stretch: { name: "Horizontal Cross-Body Stretch", cue: "Bring arm across chest, use other hand to pull at elbow. Keep shoulder down. 30s × 3." },
    followUp: ["t3","s2"],
  },
  // LUMBAR
  "QL": {
    region: "lumbar",
    tpLocations: ["Between bottom rib and top of pelvis, 3–5 cm lateral to spine — the 'hip hiking' muscle"],
    referral: "Sharp lower back, hip pain lying down, hard to roll over in bed",
    tools: {
      hands: { steps: ["Stand and place fists into sides at waist — between last rib and hip crest.", "Lean back into fists to compress QL against lumbar spine.", "Hold 60–90s, breathe into the pressure.", "Laterally bend slightly away while holding for pin & stretch."], pinPoint: "Knuckles into waist at QL groove" },
      lacrosse: { steps: ["Lie on back. Place ball between waist and floor, lateral to spine (not ON spine).", "Start 3 cm from spine between last rib and iliac crest.", "Let bodyweight create pressure. 90s per point.", "While on ball: slowly lower same-side leg off a table/bed edge for pin & stretch."], pinPoint: "Ball in QL groove, lateral to lumbar spine" },
      foam: { steps: ["Lie on side with roller at waist level (between rib and hip).", "Stack hips perpendicular to floor.", "Roll slowly — pause on tender spots.", "NOT recommended if acute lower back pain is present."], pinPoint: "Side-lying, roller at waist between rib & hip" },
    },
    stretch: { name: "Side Bend Stretch", cue: "Stand, reach same arm overhead and bend away. Feel lengthening at waist. Hold 30s × 3." },
    followUp: ["l1","l5"],
  },
  "Iliopsoas": {
    region: "lumbar",
    tpLocations: ["Lower abdomen, 3–4 cm medial to ASIS (front hip bone) — deep and tender"],
    referral: "Lumbar ache, pain walking, hip flexion weakness, groin pain",
    tools: {
      hands: { steps: ["Lie on back, knees bent.", "Place fingers 3–4 cm medial to front hip bone (ASIS).", "Slowly sink down and in toward the back of the abdomen.", "Hold 60–90s at moderate pressure. AVOID if pulsing sensation felt (near aorta — move slightly lateral)."], pinPoint: "Fingers medial to ASIS, pressing posterior" },
      lacrosse: { steps: ["Lie face down. Place ball just medial and below ASIS.", "Prop on elbows to reduce body weight on the ball.", "Hold 60–90s, breathe deeply.", "Pin & stretch: while holding, slowly straighten and lower same-side leg behind you."], pinPoint: "Ball under lower abdomen / hip flexor area, prone" },
      foam: { steps: ["Foam roller too imprecise for iliopsoas — use lacrosse ball or hands for best access."], pinPoint: "N/A — lacrosse ball preferred" },
    },
    stretch: { name: "90/90 Kneeling Hip Flexor", cue: "Kneeling lunge, posterior pelvic tilt (tuck tailbone), shift forward until stretch felt at front of hip. 45s × 3." },
    followUp: ["l1","l5"],
  },
  "Piriformis": {
    region: "hips",
    tpLocations: ["Deep in the glute — halfway between sacrum and greater trochanter (outer hip bone)"],
    referral: "Deep glute ache, pseudo-sciatica down back of leg, SI joint pain",
    tools: {
      hands: { steps: ["Difficult to reach with hands. Use lacrosse ball for best results.", "If needed: seated, cross ankle over opposite knee. Press thumb into glute midpoint.", "Hold 90s at 6–7/10 while slowly uncrossing leg for pin & stretch."], pinPoint: "Thumb in glute midpoint" },
      lacrosse: { steps: ["Sit on a firm chair or the floor. Place ball under affected glute.", "Cross ankle over opposite knee (figure-4 position) — this exposes piriformis.", "Lean into ball to find tender spots. Hold 90s.", "While on ball: slowly lower knee toward floor for pin & stretch effect."], pinPoint: "Ball under mid-glute in figure-4 seated position" },
      foam: { steps: ["Sit on roller, cross ankle over opposite knee (figure-4).", "Tilt toward affected side to load piriformis.", "Slowly roll back and forth. Pause on tender points 60s.", "One of the most effective foam roller applications."], pinPoint: "Foam roller under glute, figure-4 tilt" },
    },
    stretch: { name: "Piriformis Figure-4 Stretch", cue: "Lie on back, cross ankle over knee, pull knee toward chest or push knee away. 60s × 3." },
    followUp: ["h1","h2"],
  },
  "Gluteus Medius": {
    region: "hips",
    tpLocations: ["Upper outer glute — just below the iliac crest, above and lateral to the hip joint"],
    referral: "Hip pain, side of pelvis ache, contributes to lower back pain",
    tools: {
      hands: { steps: ["Standing: press thumb into upper outer glute just below hip crest.", "Lean into a doorframe or wall to improve leverage.", "Hold tender spots 60–90s.", "Pin & stretch: while pressing, hip hike same side (hike hip toward ribs) then lower."], pinPoint: "Thumb into upper lateral glute below iliac crest" },
      lacrosse: { steps: ["Side-lying on floor. Ball under upper outer glute.", "Roll to find tender points, pause and hold 60s.", "Pin & stretch: while on ball, slowly lower and raise the top leg."], pinPoint: "Ball under upper lateral glute, side-lying" },
      foam: { steps: ["Side-lying on roller, positioned under upper outer glute.", "Use bottom leg and top hand for control.", "Roll slowly from pelvis crest to hip joint.", "Pause on tender areas 30–60s."], pinPoint: "Foam roller under upper lateral glute" },
    },
    stretch: { name: "Glute Med Side Stretch", cue: "Cross affected leg behind standing leg. Side-bend away. Feel stretch at outer hip/glute. 30s × 3." },
    followUp: ["h2","h3"],
  },
  // SHOULDERS
  "Pec Minor": {
    region: "shoulders",
    tpLocations: ["Deep under pec major — find the coracoid process (bony knob below collarbone) and press just medial/inferior"],
    referral: "Anterior shoulder pain, radiates down arm, contributes to rounded shoulders",
    tools: {
      hands: { steps: ["Find coracoid process: follow collarbone to shoulder, feel for bony bump.", "Place 2–3 fingers just below and medial to this bump.", "Press in and downward at 6/10. Hold 90s.", "Pin & stretch: while pressing, slowly retract shoulder blade back and down."], pinPoint: "Fingers below coracoid process, pressing posterior" },
      lacrosse: { steps: ["Stand facing wall. Place ball below collarbone lateral to sternum.", "Lean in to load the pec minor attachment.", "Hold tender spots 90s.", "Pin & stretch: while on ball, slowly retract shoulder back against the ball."], pinPoint: "Ball against chest wall below clavicle, medial to coracoid" },
      foam: { steps: ["Lie face down, roller angled at 45° under chest on one side.", "Support yourself on opposite forearm.", "Let gravity load pec area. Slowly sweep arm in small arcs.", "Hold tender zones 60s."], pinPoint: "Prone, roller under pec at 45°" },
    },
    stretch: { name: "Corner Chest Stretch", cue: "Stand in doorway/corner, elbows at 90°. Lean forward until stretch felt at chest. 30s × 3 at different heights." },
    followUp: ["s1","t5"],
  },
  "SCM": {
    region: "cervical",
    tpLocations: ["The visible rope-like muscle running from behind ear to collarbone — treat in its mid-belly"],
    referral: "Dizziness, eye pain, ear ache, forehead/sinus-type headache",
    tools: {
      hands: { steps: ["Gently pinch SCM between thumb and first two fingers.", "Tilt head slightly toward same side to relax the muscle.", "Use very light pressure — 4–5/10 only. SCM is sensitive.", "Slowly roll muscle between fingers. Move up and down the belly. 60s total."], pinPoint: "Gentle pinch grip on SCM belly" },
      lacrosse: { steps: ["Not recommended for SCM — too much pressure risk on vascular structures.", "Use hands only for this muscle."], pinPoint: "N/A — hands only" },
      foam: { steps: ["Not recommended for SCM. Use hands only."], pinPoint: "N/A — hands only" },
    },
    stretch: { name: "SCM Stretch", cue: "Tilt ear to shoulder, then rotate face slightly upward and away. Feel pull along front of neck. 20s × 3 each side." },
    followUp: ["c1","c2"],
  },
};

const TOOL_ICONS = { hands: "🤲", lacrosse: "⚫", foam: "🟤" };
const TOOL_LABELS = { hands: "Hands / Thumbs", lacrosse: "Lacrosse Ball", foam: "Foam Roller" };

// ── SVG ILLUSTRATIONS ─────────────────────────────────────────────────────────
// Shared drawing helpers
const Fig = ({ children, w=200, h=120, bg="#181C26" }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", maxWidth:w, display:"block", margin:"0 auto", borderRadius:10, background:bg }}>
    {children}
  </svg>
);
// Body-part primitives (all stroked, no fill unless noted)
const S = "#4ECDC4"; // accent stroke
const B = "#2A3045"; // dark fill
const SK = "#C8A882"; // skin tone
const CL = "#3A4560"; // clothing

// Standing figure: cx=head center, cy=head top, facing right by default
function StickPerson({ x=100, y=10, scale=1, color="#4ECDC4", facing="right", armL=null, armR=null, legL=null, legR=null, torsoAngle=0 }) {
  const s = scale;
  const hR = 9*s, neck=6*s, torso=28*s, arm=20*s, leg=26*s, lw=1.8*s;
  const hx=x, hy=y+hR;
  const nx1=hx, ny1=hy+hR, nx2=hx, ny2=hy+hR+neck;
  const sh1x=hx-12*s, sh1y=ny2+4*s;
  const sh2x=hx+12*s, sh2y=ny2+4*s;
  const hipY=ny2+torso;
  // Default arm/leg endpoints
  const defAL = [sh1x-arm*0.7, sh1y+arm*0.8];
  const defAR = [sh2x+arm*0.7, sh2y+arm*0.8];
  const defLL = [hx-8*s, hipY+leg];
  const defLR = [hx+8*s, hipY+leg];
  const al = armL || defAL;
  const ar = armR || defAR;
  const ll = legL || defLL;
  const lr = legR || defLR;
  return (
    <g>
      <circle cx={hx} cy={hy} r={hR} fill={SK} stroke={color} strokeWidth={lw}/>
      <line x1={nx1} y1={ny1} x2={nx2} y2={ny2} stroke={color} strokeWidth={lw}/>
      <line x1={hx} y1={ny2} x2={hx} y2={hipY} stroke={color} strokeWidth={lw*1.3}/>
      <line x1={hx} y1={ny2+4*s} x2={sh1x} y2={sh1y} stroke={color} strokeWidth={lw}/>
      <line x1={sh1x} y1={sh1y} x2={al[0]} y2={al[1]} stroke={color} strokeWidth={lw}/>
      <line x1={hx} y1={ny2+4*s} x2={sh2x} y2={sh2y} stroke={color} strokeWidth={lw}/>
      <line x1={sh2x} y1={sh2y} x2={ar[0]} y2={ar[1]} stroke={color} strokeWidth={lw}/>
      <line x1={hx} y1={hipY} x2={ll[0]} y2={ll[1]} stroke={color} strokeWidth={lw}/>
      <line x1={hx} y1={hipY} x2={lr[0]} y2={lr[1]} stroke={color} strokeWidth={lw}/>
    </g>
  );
}

// ── EXERCISE ILLUSTRATIONS ────────────────────────────────────────────────────
const EXERCISE_ILLUSTRATIONS = {
  // Cervical
  c1: () => (
    <Fig w={220} h={130}>
      {/* Seated chin tuck */}
      <rect x={60} y={85} width={100} height={10} rx={3} fill={B} stroke={CL} strokeWidth={1.5}/>
      {/* Chair back */}
      <rect x={145} y={45} width={8} height={50} rx={3} fill={B} stroke={CL} strokeWidth={1.5}/>
      {/* Person seated */}
      <StickPerson x={110} y={18} scale={0.95} color={S}
        armL={[82,72]} armR={[130,72]}
        legL={[95,100]} legR={[118,100]}/>
      {/* Arrow showing chin retraction */}
      <path d="M 118 36 Q 122 36 126 36" stroke="#FFD166" strokeWidth={2} fill="none" markerEnd="url(#arr)"/>
      <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#FFD166"/></marker></defs>
      <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Retract chin → "double chin"</text>
    </Fig>
  ),
  c2: () => (
    <Fig w={220} h={130}>
      <StickPerson x={110} y={15} scale={1} color={S}
        armL={[72,58]} armR={[140,52]}
        legL={[98,105]} legR={[122,105]}/>
      {/* Hand on head indicator */}
      <circle cx={138} cy={35} r={5} fill={SK} stroke={S} strokeWidth={1.5}/>
      {/* Head tilt arc */}
      <path d="M 104 30 Q 100 38 103 44" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ear to shoulder, hand on head</text>
    </Fig>
  ),
  c3: () => (
    <Fig w={220} h={130}>
      <StickPerson x={110} y={15} scale={1} color={S}
        armL={[75,65]} armR={[145,55]}
        legL={[98,105]} legR={[122,105]}/>
      <path d="M 116 27 Q 122 24 124 30" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Rotate 45° then tilt away</text>
    </Fig>
  ),
  c4: () => (
    <Fig w={220} h={130}>
      {/* Supine on floor */}
      <rect x={20} y={98} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
      {/* Person lying */}
      <ellipse cx={110} cy={95} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={110} y1={103} x2={110} y2={93} stroke={S} strokeWidth={2}/>
      <line x1={110} y1={93} x2={60} y2={93} stroke={S} strokeWidth={2}/>
      <line x1={110} y1={96} x2={75} y2={103} stroke={S} strokeWidth={2}/>
      <line x1={110} y1={96} x2={155} y2={103} stroke={S} strokeWidth={2}/>
      <line x1={75} y1={103} x2={90} y2={96} stroke={S} strokeWidth={2}/>
      <line x1={155} y1={103} x2={165} y2={96} stroke={S} strokeWidth={2}/>
      {/* Arrow nod */}
      <path d="M 102 91 Q 102 86 107 86" stroke="#FFD166" strokeWidth={2} fill="none" markerEnd="url(#arr2)"/>
      <defs><marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#FFD166"/></marker></defs>
      <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Supine slow nod, chin tucked</text>
    </Fig>
  ),
  // Thoracic
  t1: () => (
    <Fig w={220} h={130}>
      {/* Foam roller */}
      <ellipse cx={110} cy={98} rx={70} ry={10} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
      <rect x={40} y={88} width={140} height={10} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
      <ellipse cx={110} cy={88} rx={70} ry={10} fill="#9B5523" stroke="#A0522D" strokeWidth={2}/>
      {/* Person arching over roller */}
      <ellipse cx={110} cy={82} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <path d="M 110 90 Q 130 92 150 90 Q 155 95 150 98" stroke={S} strokeWidth={2} fill="none"/>
      <path d="M 110 90 Q 90 92 70 90 Q 65 95 70 98" stroke={S} strokeWidth={2} fill="none"/>
      <line x1={150} y1={98} x2={168} y2={103} stroke={S} strokeWidth={2}/>
      <line x1={70} y1={98} x2={52} y2={103} stroke={S} strokeWidth={2}/>
      <line x1={90} y1={76} x2={75} y2={68} stroke={S} strokeWidth={2}/>
      <line x1={130} y1={76} x2={145} y2={68} stroke={S} strokeWidth={2}/>
      <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Arch thoracic over roller</text>
    </Fig>
  ),
  t2: () => (
    <Fig w={220} h={130}>
      {/* Quadruped cat position */}
      <rect x={30} y={103} width={160} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={80} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      {/* Rounded spine (cat) */}
      <path d="M 80 103 Q 100 82 130 82 Q 150 82 148 95" stroke={S} strokeWidth={2.5} fill="none"/>
      <line x1={80} y1={103} x2={68} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={148} y1={95} x2={160} y2={107} stroke={S} strokeWidth={2}/>
      <line x1={90} y1={103} x2={88} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={138} y1={95} x2={136} y2={110} stroke={S} strokeWidth={2}/>
      <path d="M 115 80 Q 118 72 115 68" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Quadruped — arch & round spine</text>
    </Fig>
  ),
  t3: () => (
    <Fig w={220} h={130}>
      <rect x={65} y={90} width={90} height={10} rx={3} fill={B} stroke={CL} strokeWidth={1.5}/>
      <rect x={148} y={50} width={7} height={50} rx={3} fill={B} stroke={CL} strokeWidth={1.5}/>
      <StickPerson x={110} y={18} scale={0.95} color={S}
        armL={[125,58]} armR={[100,55]}
        legL={[95,103]} legR={[118,103]}/>
      <path d="M 120 38 Q 128 42 126 52" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Rotate from thoracic, arms crossed</text>
    </Fig>
  ),
  t4: () => (
    <Fig w={220} h={130}>
      {/* Prone Y position */}
      <rect x={20} y={98} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={110} cy={93} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={110} y1={100} x2={60} y2={100} stroke={S} strokeWidth={2.2}/>
      <line x1={110} y1={100} x2={155} y2={100} stroke={S} strokeWidth={2.2}/>
      <line x1={60} y1={100} x2={52} y2={96} stroke={S} strokeWidth={2}/>
      <line x1={155} y1={100} x2={163} y2={96} stroke={S} strokeWidth={2}/>
      {/* Y arms raised */}
      <line x1={90} y1={96} x2={68} y2={80} stroke={S} strokeWidth={2}/>
      <line x1={130} y1={96} x2={152} y2={80} stroke={S} strokeWidth={2}/>
      <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Prone — lift arms in Y shape</text>
    </Fig>
  ),
  t5: () => (
    <Fig w={220} h={130}>
      <StickPerson x={110} y={18} scale={1} color={S}
        armL={[62,58]} armR={[158,58]}
        legL={[98,105]} legR={[122,105]}/>
      {/* Band */}
      <path d="M 65 58 Q 110 52 155 58" stroke="#FFD166" strokeWidth={3} fill="none"/>
      <path d="M 108 58 Q 110 54 112 58" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Pull band apart, retract scapulae</text>
    </Fig>
  ),
  // Lumbar
  l1: () => (
    <Fig w={220} h={140}>
      {/* Half kneeling lunge */}
      <rect x={20} y={115} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <StickPerson x={100} y={15} scale={1.1} color={S}
        armL={[68,72]} armR={[132,72]}
        legL={[78,118]} legR={[120,98]}/>
      <line x1={120} y1={98} x2={120} y2={118} stroke={S} strokeWidth={2}/>
      <path d="M 100 92 Q 105 100 108 108" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={132} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Half-kneeling, tuck tailbone</text>
    </Fig>
  ),
  l2: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={103} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={80} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={80} y1={105} x2={145} y2={105} stroke={S} strokeWidth={2.2}/>
      {/* Arm up left, leg up right */}
      <line x1={90} y1={103} x2={88} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={135} y1={103} x2={133} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={85} y1={99} x2={70} y2={86} stroke={S} strokeWidth={2}/>
      <line x1={140} y1={103} x2={158} y2={93} stroke={S} strokeWidth={2}/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Supine — extend opp. arm & leg</text>
    </Fig>
  ),
  l3: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={105} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={90} cy={98} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={90} y1={105} x2={150} y2={105} stroke={S} strokeWidth={2.2}/>
      <line x1={90} y1={105} x2={88} y2={112} stroke={S} strokeWidth={2}/>
      <line x1={150} y1={105} x2={148} y2={112} stroke={S} strokeWidth={2}/>
      {/* Arm forward, leg back */}
      <line x1={94} y1={101} x2={68} y2={90} stroke={S} strokeWidth={2}/>
      <line x1={145} y1={103} x2={170} y2={95} stroke={S} strokeWidth={2}/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Quadruped — opp. arm & leg</text>
    </Fig>
  ),
  l4: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={103} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={80} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={80} y1={105} x2={145} y2={105} stroke={S} strokeWidth={2.2}/>
      <line x1={90} y1={103} x2={88} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={140} y1={105} x2={152} y2={110} stroke={S} strokeWidth={2}/>
      {/* One knee bent */}
      <line x1={135} y1={105} x2={125} y2={96} stroke={S} strokeWidth={2}/>
      {/* Curl up slightly */}
      <path d="M 80 97 Q 85 90 93 88" stroke="#FFD166" strokeWidth={2} fill="none"/>
      {/* Hands under lumbar */}
      <line x1={108} y1={104} x2={118} y2={104} stroke={SK} strokeWidth={3}/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Supine — curl up, hands at low back</text>
    </Fig>
  ),
  l5: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={105} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={80} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={80} y1={105} x2={148} y2={105} stroke={S} strokeWidth={2.2}/>
      {/* Hips bridged up */}
      <path d="M 90 105 Q 100 88 118 86 Q 132 86 142 98" stroke={S} strokeWidth={2.5} fill="none"/>
      <line x1={90} y1={105} x2={85} y2={112} stroke={S} strokeWidth={2}/>
      <line x1={142} y1={98} x2={150} y2={108} stroke={S} strokeWidth={2}/>
      <line x1={78} y1={95} x2={65} y2={100} stroke={S} strokeWidth={2}/>
      <line x1={78} y1={97} x2={65} y2={104} stroke={S} strokeWidth={2}/>
      <path d="M 115 84 Q 115 78 115 74" stroke="#FFD166" strokeWidth={2} fill="none" markerEnd="url(#arrup)"/>
      <defs><marker id="arrup" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#FFD166"/></marker></defs>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Bridge hips up, squeeze glutes</text>
    </Fig>
  ),
  // Hips
  h1: () => (
    <Fig w={220} h={140}>
      <rect x={20} y={115} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      {/* Pigeon pose */}
      <ellipse cx={90} cy={85} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={90} y1={93} x2={90} y2={112} stroke={S} strokeWidth={2}/>
      {/* Front bent leg */}
      <path d="M 90 112 Q 110 118 118 115" stroke={S} strokeWidth={2} fill="none"/>
      {/* Back straight leg */}
      <line x1={90} y1={112} x2={62} y2={118} stroke={S} strokeWidth={2}/>
      {/* Arms forward */}
      <line x1={90} y1={98} x2={65} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={90} y1={98} x2={115} y2={108} stroke={S} strokeWidth={2}/>
      <text x={110} y={132} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Pigeon — hips square, sink down</text>
    </Fig>
  ),
  h2: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={103} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      {/* Side-lying clamshell */}
      <ellipse cx={72} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={72} y1={105} x2={148} y2={105} stroke={S} strokeWidth={2.2}/>
      <line x1={80} y1={103} x2={78} y2={110} stroke={S} strokeWidth={2}/>
      {/* Knees bent, top knee opening */}
      <path d="M 130 105 Q 120 98 118 105" stroke={S} strokeWidth={2} fill="none"/>
      <path d="M 130 105 Q 142 92 144 105" stroke={S} strokeWidth={2.5} fill="none"/>
      {/* Band */}
      <path d="M 122 103 Q 133 96 142 102" stroke="#FFD166" strokeWidth={2.5} fill="none"/>
      <path d="M 72 97 Q 78 90 86 96" stroke={S} strokeWidth={2} fill="none"/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying — open top knee (band)</text>
    </Fig>
  ),
  h3: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={103} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={72} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={72} y1={105} x2={148} y2={105} stroke={S} strokeWidth={2.2}/>
      <line x1={80} y1={103} x2={78} y2={110} stroke={S} strokeWidth={2}/>
      <line x1={72} y1={97} x2={62} y2={92} stroke={S} strokeWidth={2}/>
      <line x1={72} y1={97} x2={82} y2={92} stroke={S} strokeWidth={2}/>
      {/* Top leg lifting */}
      <line x1={130} y1={105} x2={155} y2={95} stroke={S} strokeWidth={2.5}/>
      <path d="M 145 100 Q 148 94 152 97" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying — lift top leg straight</text>
    </Fig>
  ),
  h4: () => (
    <Fig w={220} h={140}>
      {/* Deep squat */}
      <rect x={20} y={118} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={110} cy={52} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={110} y1={60} x2={110} y2={82} stroke={S} strokeWidth={2.2}/>
      {/* Arms out */}
      <line x1={110} y1={68} x2={82} y2={72} stroke={S} strokeWidth={2}/>
      <line x1={110} y1={68} x2={138} y2={72} stroke={S} strokeWidth={2}/>
      {/* Knees out, hips low */}
      <path d="M 110 82 Q 90 90 78 112" stroke={S} strokeWidth={2} fill="none"/>
      <path d="M 110 82 Q 130 90 142 112" stroke={S} strokeWidth={2} fill="none"/>
      <line x1={78} y1={112} x2={72} y2={120} stroke={S} strokeWidth={2}/>
      <line x1={142} y1={112} x2={148} y2={120} stroke={S} strokeWidth={2}/>
      <text x={110} y={134} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Deep squat — heels down, knees out</text>
    </Fig>
  ),
  // Shoulders
  s1: () => (
    <Fig w={220} h={140}>
      {/* Doorway stretch */}
      <rect x={50} y={10} width={8} height={120} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
      <rect x={162} y={10} width={8} height={120} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
      <StickPerson x={110} y={20} scale={1} color={S}
        armL={[52,65]} armR={[168,65]}
        legL={[98,118]} legR={[122,118]}/>
      <path d="M 115 55 Q 122 58 118 68" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={135} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Arms on doorframe, lean forward</text>
    </Fig>
  ),
  s2: () => (
    <Fig w={220} h={130}>
      <rect x={20} y={103} width={180} height={5} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
      <ellipse cx={72} cy={97} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
      <line x1={72} y1={105} x2={148} y2={105} stroke={S} strokeWidth={2.2}/>
      <line x1={80} y1={103} x2={78} y2={110} stroke={S} strokeWidth={2}/>
      {/* Top arm pressing down */}
      <path d="M 110 99 L 128 105" stroke={S} strokeWidth={2.5}/>
      <path d="M 128 105 L 128 99" stroke="#FF6B6B" strokeWidth={2}/>
      <path d="M 125 99 Q 128 95 131 99" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={122} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying — press wrist toward floor</text>
    </Fig>
  ),
  s3: () => (
    <Fig w={220} h={140}>
      {/* Wall angels */}
      <rect x={165} y={5} width={8} height={130} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
      <StickPerson x={105} y={20} scale={1.05} color={S}
        armL={[72,55]} armR={[162,55]}
        legL={[92,120]} legR={[118,120]}/>
      <path d="M 152 52 Q 162 45 162 55" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={100} y={135} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Back flat on wall, raise arms</text>
    </Fig>
  ),
  s4: () => (
    <Fig w={220} h={130}>
      <StickPerson x={110} y={18} scale={1} color={S}
        armL={[78,68]} armR={[142,58]}
        legL={[98,105]} legR={[122,105]}/>
      {/* Band from elbow to anchor */}
      <path d="M 142 58 Q 155 55 160 62" stroke="#FFD166" strokeWidth={3} fill="none"/>
      <path d="M 130 62 Q 138 55 142 58" stroke="#FFD166" strokeWidth={2} fill="none"/>
      <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Elbow at 90°, rotate arm outward</text>
    </Fig>
  ),
};

// ── MASSAGE ILLUSTRATIONS ─────────────────────────────────────────────────────
const MASSAGE_ILLUSTRATIONS = {
  "Suboccipitals": {
    hands: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={92} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={110} y1={101} x2={55} y2={101} stroke={S} strokeWidth={2.5}/>
        <line x1={110} y1={101} x2={165} y2={101} stroke={S} strokeWidth={2.5}/>
        <line x1={55} y1={101} x2={48} y2={108} stroke={S} strokeWidth={2}/>
        <line x1={165} y1={101} x2={172} y2={108} stroke={S} strokeWidth={2}/>
        {/* Fingers at skull base */}
        <path d="M 95 90 Q 96 85 100 84 Q 104 83 108 84" stroke={SK} strokeWidth={4} fill="none"/>
        <path d="M 112 84 Q 116 83 120 84 Q 124 85 125 90" stroke={SK} strokeWidth={4} fill="none"/>
        <path d="M 100 84 Q 100 79 103 79" stroke="#FF6B6B" strokeWidth={2} fill="none"/>
        <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Fingertips press up at skull base</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={92} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={110} y1={101} x2={55} y2={101} stroke={S} strokeWidth={2.5}/>
        <line x1={110} y1={101} x2={165} y2={101} stroke={S} strokeWidth={2.5}/>
        <circle cx={110} cy={88} r={7} fill="#222" stroke="#4ECDC4" strokeWidth={2}/>
        <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball at skull base, supine</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={80} cy={90} rx={70} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={110} cy={83} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={110} y1={92} x2={55} y2={101} stroke={S} strokeWidth={2.5}/>
        <line x1={110} y1={92} x2={165} y2={101} stroke={S} strokeWidth={2.5}/>
        <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Upper neck on roller — go slow</text>
      </Fig>
    ),
  },
  "Upper Trapezius": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[78,55]} armR={[130,52]}
          legL={[98,112]} legR={[122,112]}/>
        {/* Pinch grip on trap */}
        <ellipse cx={93} cy={57} rx={8} ry={5} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Pinch upper trap, tilt ear away</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={170} y={10} width={8} height={115} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
        <StickPerson x={105} y={18} scale={1} color={S}
          armL={[72,68]} armR={[162,68]}
          legL={[92,112]} legR={[118,112]}/>
        <circle cx={158} cy={65} r={8} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={100} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball between trap & wall, lean in</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={95} rx={70} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={72} cy={87} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={72} y1={95} x2={148} y2={95} stroke={S} strokeWidth={2.2}/>
        <line x1={80} y1={93} x2={78} y2={100} stroke={S} strokeWidth={2}/>
        <line x1={138} y1={95} x2={150} y2={100} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying on roller at upper trap</text>
      </Fig>
    ),
  },
  "Piriformis": {
    hands: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={72} cy={92} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={72} y1={100} x2={148} y2={100} stroke={S} strokeWidth={2.2}/>
        {/* Figure 4 legs */}
        <path d="M 130 100 Q 120 90 108 100" stroke={S} strokeWidth={2} fill="none"/>
        <path d="M 108 100 Q 118 86 135 88" stroke={S} strokeWidth={2} fill="none"/>
        <line x1={80} y1={98} x2={78} y2={105} stroke={S} strokeWidth={2}/>
        <path d="M 118 92 Q 122 88 126 90" stroke="#FFD166" strokeWidth={2.5} fill="none"/>
        <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Figure-4, thumb presses mid-glute</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={60} y={95} width={100} height={8} rx={3} fill={B} stroke={CL} strokeWidth={1.5}/>
        <rect x={60} y={78} width={100} height={18} rx={5} fill={CL} stroke={S} strokeWidth={1}/>
        <ellipse cx={80} cy={72} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        {/* Seated figure 4 */}
        <line x1={80} y1={80} x2={75} y2={95} stroke={S} strokeWidth={2}/>
        <line x1={80} y1={80} x2={140} y2={90} stroke={S} strokeWidth={2}/>
        <path d="M 120 88 Q 118 80 130 78" stroke={S} strokeWidth={2} fill="none"/>
        <circle cx={105} cy={92} r={6} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Seated figure-4, ball under glute</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={95} rx={70} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={90} cy={83} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={90} y1={91} x2={70} y2={96} stroke={S} strokeWidth={2}/>
        {/* Figure 4 on roller */}
        <path d="M 90 91 Q 110 86 125 92" stroke={S} strokeWidth={2} fill="none"/>
        <path d="M 125 92 Q 138 86 140 95" stroke={S} strokeWidth={2} fill="none"/>
        <line x1={80} y1={88} x2={72} y2={94} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Figure-4 tilt on foam roller</text>
      </Fig>
    ),
  },
  "QL": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[85,72]} armR={[135,72]}
          legL={[98,112]} legR={[122,112]}/>
        {/* Knuckles into waist */}
        <ellipse cx={88} cy={72} rx={7} ry={4} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <ellipse cx={132} cy={72} rx={7} ry={4} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Knuckles into waist, lean back</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={92} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={110} y1={101} x2={55} y2={101} stroke={S} strokeWidth={2.5}/>
        <line x1={110} y1={101} x2={165} y2={101} stroke={S} strokeWidth={2.5}/>
        <line x1={55} y1={101} x2={48} y2={108} stroke={S} strokeWidth={2}/>
        <line x1={165} y1={101} x2={172} y2={108} stroke={S} strokeWidth={2}/>
        {/* Ball at waist */}
        <circle cx={128} cy={99} r={7} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={120} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball lateral to spine at waist, supine</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={92} rx={80} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={72} cy={82} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={72} y1={90} x2={148} y2={93} stroke={S} strokeWidth={2.2}/>
        <line x1={80} y1={88} x2={78} y2={98} stroke={S} strokeWidth={2}/>
        <line x1={140} y1={92} x2={152} y2={98} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying, roller at waist</text>
      </Fig>
    ),
  },
  "Iliopsoas": {
    hands: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={80} cy={90} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={80} y1={99} x2={150} y2={99} stroke={S} strokeWidth={2.5}/>
        <line x1={80} y1={99} x2={58} y2={106} stroke={S} strokeWidth={2}/>
        <line x1={150} y1={99} x2={162} y2={106} stroke={S} strokeWidth={2}/>
        <path d="M 150 99 Q 140 96 136 99" stroke={S} strokeWidth={2} fill="none"/>
        {/* Fingers pressing in */}
        <path d="M 115 96 Q 118 90 120 94" stroke={SK} strokeWidth={3} fill="none"/>
        <circle cx={118} cy={94} r={4} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Supine — fingers medial to ASIS</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={80} cy={82} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={80} y1={90} x2={148} y2={92} stroke={S} strokeWidth={2.2}/>
        <line x1={80} y1={90} x2={58} y2={100} stroke={S} strokeWidth={2}/>
        <line x1={148} y1={92} x2={160} y2={100} stroke={S} strokeWidth={2}/>
        <line x1={80} y1={85} x2={65} y2={90} stroke={S} strokeWidth={2}/>
        <circle cx={118} cy={90} r={7} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Prone — ball under lower abdomen</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <text x={110} y={60} textAnchor="middle" fontSize={13} fill={S}>⚠️</text>
        <text x={110} y={80} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Use lacrosse ball or hands</text>
        <text x={110} y={95} textAnchor="middle" fontSize={10} fill={COLORS.muted}>for best access to iliopsoas</text>
        <text x={110} y={115} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Foam roller not recommended here</text>
      </Fig>
    ),
  },
  "Gluteus Medius": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[78,68]} armR={[142,68]}
          legL={[98,112]} legR={[122,112]}/>
        <ellipse cx={98} cy={72} rx={6} ry={4} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Thumb into upper lateral glute</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={72} cy={92} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={72} y1={100} x2={148} y2={100} stroke={S} strokeWidth={2.2}/>
        <line x1={80} y1={98} x2={78} y2={106} stroke={S} strokeWidth={2}/>
        <line x1={72} y1={96} x2={62} y2={90} stroke={S} strokeWidth={2}/>
        <line x1={72} y1={96} x2={82} y2={90} stroke={S} strokeWidth={2}/>
        {/* Top leg raised slightly */}
        <line x1={130} y1={100} x2={158} y2={96} stroke={S} strokeWidth={2.5}/>
        <circle cx={110} cy={99} r={6} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying, ball under upper glute</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={95} rx={70} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={72} cy={84} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={72} y1={92} x2={148} y2={95} stroke={S} strokeWidth={2.2}/>
        <line x1={80} y1={90} x2={78} y2={100} stroke={S} strokeWidth={2}/>
        <line x1={148} y1={95} x2={158} y2={100} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Side-lying roller under upper glute</text>
      </Fig>
    ),
  },
  "Rhomboids": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[130,58]} armR={[92,58]}
          legL={[98,112]} legR={[122,112]}/>
        <path d="M 96 55 Q 98 50 104 52" stroke="#FFD166" strokeWidth={2} fill="none"/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Arms crossed, fingers between blade & spine</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={168} y={10} width={8} height={115} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
        <StickPerson x={105} y={18} scale={1} color={S}
          armL={[72,68]} armR={[160,68]}
          legL={[92,112]} legR={[118,112]}/>
        <circle cx={160} cy={65} r={8} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={100} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball between blade & spine, at wall</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={92} rx={80} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={80} cy={80} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={80} y1={89} x2={148} y2={91} stroke={S} strokeWidth={2.2}/>
        <line x1={68} y1={88} x2={60} y2={98} stroke={S} strokeWidth={2}/>
        <line x1={148} y1={91} x2={158} y2={98} stroke={S} strokeWidth={2}/>
        {/* Arms crossed */}
        <line x1={80} y1={83} x2={100} y2={78} stroke={S} strokeWidth={2}/>
        <line x1={80} y1={83} x2={60} y2={78} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Mid-back on roller, arms crossed</text>
      </Fig>
    ),
  },
  "Pec Minor": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[78,68]} armR={[142,68]}
          legL={[98,112]} legR={[122,112]}/>
        <circle cx={127} cy={56} r={5} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <path d="M 124 52 Q 120 48 116 50" stroke="#FFD166" strokeWidth={1.5} fill="none"/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Fingers below coracoid, press in</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={10} y={10} width={8} height={115} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
        <StickPerson x={115} y={18} scale={1} color={S}
          armL={[20,62]} armR={[148,68]}
          legL={[103,112]} legR={[127,112]}/>
        <circle cx={22} cy={60} r={8} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball on chest against wall, lean in</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        {/* Prone on angled roller */}
        <ellipse cx={100} cy={93} rx={65} ry={8} fill="#8B4513" stroke="#A0522D" strokeWidth={2} transform="rotate(-15 100 93)"/>
        <ellipse cx={80} cy={78} rx={7} ry={8} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={80} y1={86} x2={145} y2={95} stroke={S} strokeWidth={2.2}/>
        <line x1={80} y1={82} x2={58} y2={78} stroke={S} strokeWidth={2}/>
        <line x1={80} y1={84} x2={60} y2={90} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Prone — roller at 45° under chest</text>
      </Fig>
    ),
  },
  "SCM": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[130,52]} armR={[142,68]}
          legL={[98,112]} legR={[122,112]}/>
        <ellipse cx={125} cy={42} rx={6} ry={3} fill="none" stroke="#FFD166" strokeWidth={2} transform="rotate(-30 125 42)"/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Gentle pinch grip on SCM belly</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <text x={110} y={55} textAnchor="middle" fontSize={13} fill={S}>⚠️</text>
        <text x={110} y={75} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Not recommended — vascular risk</text>
        <text x={110} y={92} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Use hands only for SCM</text>
        <text x={110} y={115} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Lacrosse ball not safe here</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <text x={110} y={55} textAnchor="middle" fontSize={13} fill={S}>⚠️</text>
        <text x={110} y={75} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Not recommended</text>
        <text x={110} y={92} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Use hands only for SCM</text>
        <text x={110} y={115} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Foam roller not safe here</text>
      </Fig>
    ),
  },
  "Levator Scapulae": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[128,55]} armR={[142,68]}
          legL={[98,112]} legR={[122,112]}/>
        <circle cx={122} cy={58} r={5} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Fingers at inner top of shoulder blade</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={168} y={10} width={8} height={115} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
        <StickPerson x={105} y={18} scale={1} color={S}
          armL={[72,68]} armR={[162,68]}
          legL={[92,112]} legR={[118,112]}/>
        <circle cx={160} cy={62} r={8} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={100} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball at upper scapula angle, wall</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <text x={110} y={60} textAnchor="middle" fontSize={13} fill={S}>💡</text>
        <text x={110} y={78} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Foam roller too imprecise here</text>
        <text x={110} y={95} textAnchor="middle" fontSize={10} fill={COLORS.muted}>Use lacrosse ball for best results</text>
        <text x={110} y={115} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Lacrosse ball preferred</text>
      </Fig>
    ),
  },
  "Infraspinatus": {
    hands: () => (
      <Fig w={220} h={130}>
        <StickPerson x={110} y={18} scale={1} color={S}
          armL={[128,55]} armR={[82,68]}
          legL={[98,112]} legR={[122,112]}/>
        <circle cx={126} cy={62} r={6} fill="none" stroke="#FFD166" strokeWidth={2}/>
        <text x={110} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Fingers in infraspinous fossa</text>
      </Fig>
    ),
    lacrosse: () => (
      <Fig w={220} h={130}>
        <rect x={168} y={10} width={8} height={115} rx={2} fill={B} stroke={CL} strokeWidth={1.5}/>
        <StickPerson x={105} y={18} scale={1} color={S}
          armL={[72,68]} armR={[162,68]}
          legL={[92,112]} legR={[118,112]}/>
        <circle cx={160} cy={68} r={8} fill="#222" stroke="#FFD166" strokeWidth={2}/>
        <text x={100} y={125} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Ball on mid-scapula at wall</text>
      </Fig>
    ),
    foam: () => (
      <Fig w={220} h={130}>
        <rect x={20} y={100} width={180} height={6} rx={2} fill={B} stroke={CL} strokeWidth={1}/>
        <ellipse cx={110} cy={92} rx={80} ry={9} fill="#8B4513" stroke="#A0522D" strokeWidth={2}/>
        <ellipse cx={80} cy={80} rx={8} ry={9} fill={SK} stroke={S} strokeWidth={1.5}/>
        <line x1={80} y1={89} x2={148} y2={91} stroke={S} strokeWidth={2.2}/>
        <line x1={68} y1={88} x2={60} y2={98} stroke={S} strokeWidth={2}/>
        <line x1={148} y1={91} x2={158} y2={98} stroke={S} strokeWidth={2}/>
        <text x={110} y={118} textAnchor="middle" fontSize={9} fill={S} fontFamily="monospace">Supine, tilt onto blade on roller</text>
      </Fig>
    ),
  },
};

// ── UTILITIES ──────────────────────────────────────────────────────────────

function Badge({ label, color }) {
  return (
    <span style={{ background: color+"22", color, border:`1px solid ${color}55`, borderRadius:4, padding:"2px 8px", fontSize:11, fontFamily:"monospace", fontWeight:600 }}>
      {label}
    </span>
  );
}

function BreathTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState("inhale"); // inhale / hold / exhale
  const [breathCount, setBreathCount] = useState(0);
  const ref = useRef();

  useEffect(() => {
    if (remaining <= 0) { onDone && onDone(); return; }
    ref.current = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(ref.current);
  }, []);

  useEffect(() => {
    const cycle = seconds - remaining;
    const pos = cycle % 12;
    if (pos < 4) setPhase("inhale");
    else if (pos < 6) setPhase("hold");
    else setPhase("exhale");
    if (cycle > 0 && cycle % 12 === 0) setBreathCount(b => b + 1);
  }, [remaining]);

  const pct = (remaining / seconds) * 100;
  const phaseColor = { inhale: COLORS.accent, hold: COLORS.gold, exhale: COLORS.purple }[phase];

  return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <div style={{ position:"relative", width:120, height:120, margin:"0 auto 16px" }}>
        <svg viewBox="0 0 120 120" style={{ width:120, height:120, transform:"rotate(-90deg)" }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke={COLORS.border} strokeWidth="6"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke={phaseColor} strokeWidth="6"
            strokeDasharray={`${2*Math.PI*52}`}
            strokeDashoffset={`${2*Math.PI*52*(1-pct/100)}`}
            style={{ transition:"stroke-dashoffset 0.9s linear, stroke 0.5s" }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:26, fontWeight:900, color:COLORS.text }}>{remaining}</div>
          <div style={{ fontSize:10, color:COLORS.muted }}>sec</div>
        </div>
      </div>
      <div style={{ fontSize:18, fontWeight:800, color:phaseColor, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>{phase}</div>
      <div style={{ fontSize:12, color:COLORS.muted }}>Breaths: {breathCount}</div>
    </div>
  );
}

// ── BODY DIAGRAM ───────────────────────────────────────────────────────────

function BodyDiagram({ selectedRegions, onToggle, compact }) {
  const clickZones = [
    { id:"cervical",  label:"Neck",    x:109, y:56,  w:42, h:34 },
    { id:"shoulders", label:"Shoulders",x:60, y:86,  w:140,h:26 },
    { id:"thoracic",  label:"T-Spine", x:96,  y:88,  w:68, h:52 },
    { id:"lumbar",    label:"L-Spine", x:98,  y:142, w:64, h:38 },
    { id:"hips",      label:"Hips",    x:88,  y:178, w:84, h:34 },
  ];
  return (
    <svg viewBox="0 0 260 290" style={{ width:"100%", maxWidth:compact?160:200, display:"block", margin:"0 auto" }}>
      <ellipse cx="130" cy="44" rx="22" ry="24" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <path d="M108,86 L95,86 Q68,80 58,92 L48,132 L62,136 L68,108 L96,104 L96,86" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <path d="M152,86 L165,86 Q192,80 202,92 L212,132 L198,136 L192,108 L164,104 L164,86" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <rect x="40" y="108" width="14" height="56" rx="7" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <rect x="206" y="108" width="14" height="56" rx="7" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <path d="M96,86 Q100,84 130,84 Q160,84 164,86 L166,142 Q148,148 130,148 Q112,148 94,142 Z" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <path d="M98,142 Q112,148 130,148 Q148,148 162,142 L160,180 Q148,185 130,185 Q112,185 100,180 Z" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <path d="M88,178 Q112,185 130,185 Q148,185 172,178 L174,212 Q148,218 130,218 Q112,218 86,212 Z" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <rect x="88" y="212" width="26" height="62" rx="10" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      <rect x="146" y="212" width="26" height="62" rx="10" fill="#2A3045" stroke="#3A4560" strokeWidth="1.5"/>
      {clickZones.map(z => {
        const active = selectedRegions.includes(z.id);
        const region = REGIONS.find(r => r.id === z.id);
        return (
          <g key={z.id} onClick={() => onToggle && onToggle(z.id)} style={{ cursor: onToggle ? "pointer":"default" }}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="6"
              fill={active ? region.color+"55" : "transparent"}
              stroke={active ? region.color : "transparent"} strokeWidth="2"
              style={{ transition:"all 0.2s" }}/>
            {active && <text x={z.x+z.w/2} y={z.y+z.h/2+4} textAnchor="middle" fontSize="9" fill={region.color} fontWeight="bold" fontFamily="monospace">{z.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── MASSAGE SCREEN ────────────────────────────────────────────────────────────

function MassageScreen({ client }) {
  const [mode, setMode] = useState(null); // null | "symptom" | "explore" | "protocol"
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedTool, setSelectedTool] = useState("lacrosse");
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecs, setTimerSecs] = useState(90);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const muscleData = selectedMuscle ? MUSCLES[selectedMuscle] : null;
  const toolData = muscleData?.tools[selectedTool];

  function startProtocol(muscleName, tool = "lacrosse") {
    setSelectedMuscle(muscleName);
    setSelectedTool(tool);
    setMode("protocol");
    setCurrentStep(0);
    setTimerActive(false);
  }

  function startTimer(secs) {
    setTimerSecs(secs);
    setTimerKey(k => k+1);
    setTimerActive(true);
  }

  // Symptom → Source mode
  if (mode === "symptom" && !selectedSymptom) {
    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => setMode(null)} style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Back</button>
          <h2 style={{ fontSize:20, fontWeight:900, color:COLORS.text, margin:0 }}>Where do you feel it?</h2>
        </div>
        <p style={{ color:COLORS.muted, fontSize:13, marginBottom:20 }}>Select your symptom. We'll trace it to the source muscle(s) to treat.</p>
        {SYMPTOM_MAP.map(s => (
          <div key={s.symptom} onClick={() => setSelectedSymptom(s)}
            style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:COLORS.text }}>{s.symptom}</div>
              <div style={{ fontSize:12, color:COLORS.muted, marginTop:3 }}>{s.muscles.join(" · ")}</div>
            </div>
            <span style={{ color:COLORS.accent, fontSize:20 }}>›</span>
          </div>
        ))}
      </div>
    );
  }

  if (mode === "symptom" && selectedSymptom && !selectedMuscle) {
    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => setSelectedSymptom(null)} style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Back</button>
          <div>
            <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:1 }}>SYMPTOM SOURCE</div>
            <h2 style={{ fontSize:18, fontWeight:900, color:COLORS.text, margin:0 }}>{selectedSymptom.symptom}</h2>
          </div>
        </div>
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.warn}33`, borderRadius:12, padding:14, marginBottom:20 }}>
          <div style={{ fontSize:12, color:COLORS.warn, fontFamily:"monospace", marginBottom:6 }}>⚡ REFERRAL PATTERN</div>
          <p style={{ margin:0, fontSize:13, color:COLORS.muted }}>Pain felt at <strong style={{ color:COLORS.text }}>{selectedSymptom.symptom}</strong> is commonly referred from the muscles below. Treat the source, not the site.</p>
        </div>
        <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:12 }}>SELECT MUSCLE TO TREAT</div>
        {selectedSymptom.muscles.map(m => {
          const mData = MUSCLES[m];
          const region = mData ? REGIONS.find(r => r.id === mData.region) : null;
          return (
            <div key={m} onClick={() => mData && startProtocol(m)}
              style={{ background:COLORS.card, border:`1px solid ${region ? region.color+"44" : COLORS.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, cursor:mData?"pointer":"default", opacity:mData?1:0.5 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:COLORS.text }}>{m}</div>
                  {mData && <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>Referral: {mData.referral}</div>}
                  {!mData && <div style={{ fontSize:12, color:COLORS.muted }}>Coming soon</div>}
                </div>
                {region && <Badge label={region.label} color={region.color}/>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Explore mode — muscle map by region
  if (mode === "explore" && !selectedMuscle) {
    const musclesByRegion = {};
    Object.entries(MUSCLES).forEach(([name, data]) => {
      if (!musclesByRegion[data.region]) musclesByRegion[data.region] = [];
      musclesByRegion[data.region].push(name);
    });
    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => setMode(null)} style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Back</button>
          <h2 style={{ fontSize:20, fontWeight:900, color:COLORS.text, margin:0 }}>Muscle Explorer</h2>
        </div>
        {REGIONS.map(r => {
          const muscles = musclesByRegion[r.id] || [];
          if (!muscles.length) return null;
          return (
            <div key={r.id} style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:r.color, fontFamily:"monospace", letterSpacing:2, marginBottom:10 }}>{r.label.toUpperCase()}</div>
              {muscles.map(m => (
                <div key={m} onClick={() => startProtocol(m)}
                  style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"13px 16px", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:COLORS.text }}>{m}</div>
                    <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>Referral: {MUSCLES[m].referral}</div>
                  </div>
                  <span style={{ color:r.color, fontSize:20 }}>›</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // Protocol — full pin & stretch session
  if (mode === "protocol" && muscleData) {
    const region = REGIONS.find(r => r.id === muscleData.region);
    const steps = toolData?.steps || [];
    const isLastStep = currentStep >= steps.length - 1;

    return (
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <button onClick={() => { setSelectedMuscle(null); setTimerActive(false); setMode(mode === "protocol" ? "explore" : mode); }}
            style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Back</button>
          <div>
            <div style={{ fontSize:11, color:region?.color, fontFamily:"monospace", letterSpacing:1 }}>PIN & STRETCH PROTOCOL</div>
            <h2 style={{ fontSize:18, fontWeight:900, color:COLORS.text, margin:0 }}>{selectedMuscle}</h2>
          </div>
        </div>

        {/* Referral info */}
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:14, marginBottom:16 }}>
          <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", marginBottom:6 }}>REFERRAL PATTERN</div>
          <p style={{ margin:0, fontSize:13, color:COLORS.text }}>{muscleData.referral}</p>
          <div style={{ marginTop:8, fontSize:11, color:COLORS.muted }}>📍 {muscleData.tpLocations[0]}</div>
        </div>

        {/* Tool selector */}
        <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:10 }}>SELECT YOUR TOOL</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {Object.keys(TOOL_LABELS).map(t => (
            <button key={t} onClick={() => { setSelectedTool(t); setCurrentStep(0); setTimerActive(false); }}
              style={{ flex:1, background: selectedTool===t ? region?.color+"33" : COLORS.card, color: selectedTool===t ? region?.color : COLORS.muted, border:`1px solid ${selectedTool===t ? region?.color : COLORS.border}`, borderRadius:10, padding:"10px 6px", fontSize:11, cursor:"pointer", fontWeight:600, transition:"all 0.2s", textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{TOOL_ICONS[t]}</div>
              <div>{t === "lacrosse" ? "Ball" : t === "foam" ? "Roller" : "Hands"}</div>
            </button>
          ))}
        </div>

        {/* Pin point */}
        <div style={{ background: region?.color+"22", border:`1px solid ${region?.color}44`, borderRadius:12, padding:12, marginBottom:16 }}>
          <div style={{ fontSize:11, color:region?.color, fontFamily:"monospace", marginBottom:4 }}>📌 PIN POINT</div>
          <p style={{ margin:0, fontSize:13, color:COLORS.text }}>{toolData?.pinPoint}</p>
        </div>

        {/* Illustration */}
        {MASSAGE_ILLUSTRATIONS[selectedMuscle]?.[selectedTool] && (
          <div style={{ marginBottom:16, borderRadius:12, overflow:"hidden", border:`1px solid ${COLORS.border}` }}>
            {MASSAGE_ILLUSTRATIONS[selectedMuscle][selectedTool]()}
          </div>
        )}

        {/* Step-by-step */}
        <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:10 }}>
          STEP {currentStep+1} OF {steps.length}
        </div>
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18, marginBottom:16 }}>
          <p style={{ margin:0, fontSize:15, color:COLORS.text, lineHeight:1.7 }}>{steps[currentStep]}</p>
        </div>

        {/* Timer */}
        {!timerActive ? (
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[30,60,90].map(s => (
              <button key={s} onClick={() => startTimer(s)}
                style={{ flex:1, background:COLORS.card, border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:10, padding:12, fontSize:13, cursor:"pointer", fontWeight:600 }}>
                ⏱ {s}s
              </button>
            ))}
          </div>
        ) : (
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, marginBottom:16 }}>
            <BreathTimer key={timerKey} seconds={timerSecs} onDone={() => setTimerActive(false)}/>
            <div style={{ padding:"0 16px 16px", textAlign:"center" }}>
              <button onClick={() => setTimerActive(false)} style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:8, padding:"6px 16px", cursor:"pointer", fontSize:12 }}>Stop Timer</button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(s => s-1)}
              style={{ flex:1, background:COLORS.surface, border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:12, padding:14, cursor:"pointer", fontWeight:700, fontSize:14 }}>← Prev</button>
          )}
          <button onClick={() => !isLastStep ? setCurrentStep(s => s+1) : null}
            disabled={isLastStep}
            style={{ flex:2, background: isLastStep ? COLORS.border : region?.color, color: isLastStep ? COLORS.muted : "#000", border:"none", borderRadius:12, padding:14, cursor: isLastStep?"default":"pointer", fontWeight:900, fontSize:14, transition:"all 0.2s" }}>
            {isLastStep ? "All Steps Complete ✓" : "Next Step →"}
          </button>
        </div>

        {/* Stretch follow-up */}
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.green}44`, borderRadius:14, padding:16 }}>
          <div style={{ fontSize:11, color:COLORS.green, fontFamily:"monospace", marginBottom:6 }}>🧘 FOLLOW-UP STRETCH</div>
          <div style={{ fontWeight:700, fontSize:14, color:COLORS.text, marginBottom:6 }}>{muscleData.stretch.name}</div>
          <p style={{ margin:0, fontSize:13, color:COLORS.muted, lineHeight:1.6 }}>{muscleData.stretch.cue}</p>
        </div>
      </div>
    );
  }

  // Massage Home
  return (
    <div style={{ padding:20 }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:COLORS.text, marginBottom:4 }}>Self-Massage</h2>
      <p style={{ color:COLORS.muted, fontSize:13, marginBottom:24 }}>Release, then stretch. Three ways to find your treatment.</p>

      {[
        { id:"symptom",  icon:"⚡", title:"Where does it hurt?",    sub:"Find source muscles from your symptoms",   color:COLORS.warn },
        { id:"explore",  icon:"🗺️", title:"Muscle Explorer",         sub:"Browse trigger points by region",          color:COLORS.accent },
        { id:"protocol", icon:"🎯", title:"Quick Protocol",          sub:"Recommended for your assessed issues",     color:COLORS.green },
      ].map(item => (
        <div key={item.id} onClick={() => {
          if (item.id === "protocol") {
            // Auto-pick first recommended muscle from client issues
            const issue = client?.issues?.[0];
            const symptom = issue ? SYMPTOM_MAP.find(s => s.sources.some(src => POSTURE_ISSUES.find(p => p.id === issue)?.regions.includes(src))) : null;
            const muscle = symptom?.muscles.find(m => MUSCLES[m]) || "Suboccipitals";
            startProtocol(muscle);
          } else {
            setMode(item.id);
          }
        }}
          style={{ background:COLORS.card, border:`1px solid ${item.color}33`, borderRadius:16, padding:"18px 20px", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:item.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{item.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, color:COLORS.text, marginBottom:3 }}>{item.title}</div>
            <div style={{ fontSize:13, color:COLORS.muted }}>{item.sub}</div>
          </div>
          <span style={{ color:item.color, fontSize:22 }}>›</span>
        </div>
      ))}

      <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:16, marginTop:8 }}>
        <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:1, marginBottom:8 }}>💡 PIN & STRETCH PRINCIPLE</div>
        <p style={{ margin:0, fontSize:13, color:COLORS.muted, lineHeight:1.7 }}>
          Apply sustained pressure to a trigger point (pin), then move the muscle through its stretch range while maintaining that pressure. This combines neuromuscular inhibition with fascial lengthening for faster release.
        </p>
      </div>
    </div>
  );
}

// ── EXISTING SCREENS (unchanged) ─────────────────────────────────────────────

function ExerciseCard({ ex, region, onAdd, added }) {
  const [expanded, setExpanded] = useState(false);
  const r = REGIONS.find(r => r.id === region);
  return (
    <div style={{ background:COLORS.card, border:`1px solid ${expanded?r.color+"66":COLORS.border}`, borderRadius:12, marginBottom:10, overflow:"hidden", transition:"border-color 0.2s" }}>
      <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:COLORS.text, marginBottom:4 }}>{ex.name}</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <Badge label={ex.sets} color={r.color}/>
            {ex.hold !== "—" && <Badge label={`Hold ${ex.hold}`} color={COLORS.muted}/>}
            <Badge label={ex.difficulty} color={ex.difficulty==="Beginner"?COLORS.green:COLORS.gold}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={e => { e.stopPropagation(); onAdd(ex, region); }}
            style={{ background:added?COLORS.green+"22":r.color+"22", color:added?COLORS.green:r.color, border:`1px solid ${added?COLORS.green:r.color}55`, borderRadius:8, padding:"6px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {added?"✓":"+"}
          </button>
          <span style={{ color:COLORS.muted, fontSize:16 }}>{expanded?"▲":"▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop:`1px solid ${COLORS.border}`, padding:"12px 16px", background:COLORS.surface }}>
          {EXERCISE_ILLUSTRATIONS[ex.id] && (
            <div style={{ marginBottom:12, borderRadius:10, overflow:"hidden", border:`1px solid ${COLORS.border}` }}>
              {EXERCISE_ILLUSTRATIONS[ex.id]()}
            </div>
          )}
          <p style={{ margin:0, fontSize:13, color:COLORS.muted, lineHeight:1.6 }}>💡 {ex.cue}</p>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ client, onNavigate }) {
  const name = client?.name?.split(" ")[0] || "there";
  return (
    <div style={{ padding:20 }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, color:COLORS.accent, fontFamily:"monospace", marginBottom:4, letterSpacing:3 }}>POSTURE ALIGN</div>
        <h1 style={{ fontSize:26, fontWeight:900, color:COLORS.text, margin:0 }}>Hello, {name} 👋</h1>
        <p style={{ color:COLORS.muted, fontSize:14, margin:"6px 0 0" }}>Your posture & recovery hub</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {[
          { label:"Flagged Issues", val:client?.issues?.length||0, color:COLORS.warn },
          { label:"Regions Assessed", val:client?.regions?.length||0, color:COLORS.accent },
        ].map(s => (
          <div key={s.label} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:16, textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:12 }}>QUICK START</div>
      {[
        { label:"📋 Postural Assessment", sub:"Identify your alignment issues",       screen:"assessment", color:COLORS.accent },
        { label:"💆 Self-Massage",        sub:"Pin & stretch trigger point protocols",screen:"massage",    color:COLORS.purple },
        { label:"🏋️ Exercise Library",    sub:"Browse corrective exercises",          screen:"library",    color:COLORS.green },
        { label:"📝 My Program",          sub:"View your assigned exercises",         screen:"program",    color:COLORS.gold },
        { label:"👤 My Profile",          sub:"Track progress & history",             screen:"profile",    color:"#A78BFA" },
      ].map(item => (
        <div key={item.screen} onClick={() => onNavigate(item.screen)}
          style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:"16px 18px", marginBottom:10, cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:22 }}>{item.label.split(" ")[0]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15, color:COLORS.text }}>{item.label.slice(3)}</div>
            <div style={{ fontSize:12, color:COLORS.muted }}>{item.sub}</div>
          </div>
          <span style={{ color:item.color, fontSize:20 }}>›</span>
        </div>
      ))}
    </div>
  );
}

function AssessmentScreen({ client, onSave }) {
  const [selectedRegions, setSelectedRegions] = useState(client?.regions||[]);
  const [selectedIssues, setSelectedIssues] = useState(client?.issues||[]);
  const [notes, setNotes] = useState(client?.notes||"");
  const [saved, setSaved] = useState(false);
  function toggleRegion(id) { setSelectedRegions(p => p.includes(id)?p.filter(r=>r!==id):[...p,id]); }
  function toggleIssue(id)  { setSelectedIssues(p => p.includes(id)?p.filter(i=>i!==id):[...p,id]); }
  function handleSave() { onSave({ regions:selectedRegions, issues:selectedIssues, notes, assessedAt:new Date().toISOString() }); setSaved(true); setTimeout(()=>setSaved(false),2000); }
  return (
    <div style={{ padding:20 }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:COLORS.text, marginBottom:4 }}>Postural Assessment</h2>
      <p style={{ color:COLORS.muted, fontSize:13, marginBottom:20 }}>Tap affected regions on the body map, then flag observed issues.</p>
      <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:12 }}>BODY MAP — TAP TO SELECT</div>
      <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:16, marginBottom:20 }}>
        <BodyDiagram selectedRegions={selectedRegions} onToggle={toggleRegion}/>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16, justifyContent:"center" }}>
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => toggleRegion(r.id)}
              style={{ background:selectedRegions.includes(r.id)?r.color+"33":"transparent", color:selectedRegions.includes(r.id)?r.color:COLORS.muted, border:`1px solid ${selectedRegions.includes(r.id)?r.color:COLORS.border}`, borderRadius:20, padding:"5px 12px", fontSize:12, cursor:"pointer", transition:"all 0.2s" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:12 }}>OBSERVED POSTURAL ISSUES</div>
      <div style={{ marginBottom:20 }}>
        {POSTURE_ISSUES.map(issue => {
          const active = selectedIssues.includes(issue.id);
          return (
            <div key={issue.id} onClick={() => toggleIssue(issue.id)}
              style={{ background:active?COLORS.warn+"22":COLORS.card, border:`1px solid ${active?COLORS.warn+"99":COLORS.border}`, borderRadius:10, padding:"12px 16px", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.2s" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:active?COLORS.warn:COLORS.text }}>{issue.label}</div>
                <div style={{ fontSize:11, color:COLORS.muted, marginTop:2 }}>{issue.regions.join(" · ")}</div>
              </div>
              <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${active?COLORS.warn:COLORS.border}`, background:active?COLORS.warn:"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, transition:"all 0.2s" }}>{active?"✓":""}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:2, marginBottom:8 }}>PRACTITIONER / CLIENT NOTES</div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Pain levels, compensatory patterns, occupation demands, history..." rows={4}
        style={{ width:"100%", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:12, color:COLORS.text, fontSize:13, resize:"none", boxSizing:"border-box", outline:"none", fontFamily:"inherit" }}/>
      <button onClick={handleSave}
        style={{ marginTop:16, width:"100%", background:saved?COLORS.green:COLORS.accent, color:"#000", fontWeight:900, fontSize:16, border:"none", borderRadius:12, padding:16, cursor:"pointer", transition:"background 0.3s" }}>
        {saved?"✓ Assessment Saved!":"Save Assessment"}
      </button>
    </div>
  );
}

function LibraryScreen({ client, onAddToProgram, program }) {
  const [activeRegion, setActiveRegion] = useState(client?.regions?.[0]||"cervical");
  return (
    <div style={{ padding:20 }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:COLORS.text, marginBottom:4 }}>Exercise Library</h2>
      <p style={{ color:COLORS.muted, fontSize:13, marginBottom:16 }}>Evidence-based corrective exercises. Tap + to add to your program.</p>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:20 }}>
        {REGIONS.map(r => (
          <button key={r.id} onClick={() => setActiveRegion(r.id)}
            style={{ background:activeRegion===r.id?r.color+"33":COLORS.card, color:activeRegion===r.id?r.color:COLORS.muted, border:`1px solid ${activeRegion===r.id?r.color:COLORS.border}`, borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }}>
            {r.label}
          </button>
        ))}
      </div>
      {(EXERCISES[activeRegion]||[]).map(ex => (
        <ExerciseCard key={ex.id} ex={ex} region={activeRegion} onAdd={onAddToProgram} added={program.some(p=>p.ex.id===ex.id)}/>
      ))}
    </div>
  );
}

function ProgramScreen({ program, onRemove }) {
  return (
    <div style={{ padding:20 }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:COLORS.text, marginBottom:4 }}>My Program</h2>
      <p style={{ color:COLORS.muted, fontSize:13, marginBottom:20 }}>Your personalized corrective exercise plan.</p>
      {program.length===0 ? (
        <div style={{ background:COLORS.card, border:`1px dashed ${COLORS.border}`, borderRadius:16, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ color:COLORS.muted, fontSize:14 }}>No exercises yet. Visit the Library and tap + to add exercises.</div>
        </div>
      ) : (
        <>
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:COLORS.muted, fontSize:13 }}>Total exercises</span>
            <span style={{ color:COLORS.accent, fontWeight:700 }}>{program.length}</span>
          </div>
          {program.map(({ ex, region }, i) => {
            const r = REGIONS.find(r=>r.id===region);
            return (
              <div key={i} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:r.color+"22", border:`1px solid ${r.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:r.color, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:COLORS.text }}>{ex.name}</div>
                  <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{ex.sets}{ex.hold!=="—"?` · Hold ${ex.hold}`:""}</div>
                  <div style={{ fontSize:12, color:COLORS.muted, marginTop:6, lineHeight:1.5 }}>💡 {ex.cue}</div>
                </div>
                <button onClick={()=>onRemove(ex.id)} style={{ background:"transparent", border:"none", color:COLORS.warn, fontSize:20, cursor:"pointer", padding:"0 4px", lineHeight:1 }}>×</button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function ProfileScreen({ client, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:client?.name||"", age:client?.age||"", occupation:client?.occupation||"", goals:client?.goals||"" });
  return (
    <div style={{ padding:20 }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:COLORS.text, marginBottom:4 }}>My Profile</h2>
      <p style={{ color:COLORS.muted, fontSize:13, marginBottom:20 }}>Personal details and assessment history.</p>
      <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:700, color:COLORS.text, fontSize:16 }}>Personal Info</div>
          <button onClick={()=>setEditing(!editing)} style={{ background:"transparent", color:COLORS.accent, border:`1px solid ${COLORS.accent}55`, borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>{editing?"Cancel":"Edit"}</button>
        </div>
        {editing ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[["name","Full Name"],["age","Age"],["occupation","Occupation"],["goals","Goals / Chief Complaint"]].map(([key,label])=>(
              <div key={key}>
                <div style={{ fontSize:11, color:COLORS.muted, marginBottom:4, fontFamily:"monospace" }}>{label.toUpperCase()}</div>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                  style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:"10px 12px", color:COLORS.text, fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }}/>
              </div>
            ))}
            <button onClick={()=>{ onUpdate(form); setEditing(false); }} style={{ background:COLORS.accent, color:"#000", fontWeight:900, border:"none", borderRadius:10, padding:14, cursor:"pointer", fontSize:14 }}>Save Profile</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Name",client?.name],["Age",client?.age],["Occupation",client?.occupation],["Goals",client?.goals]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${COLORS.border}`, paddingBottom:10 }}>
                <span style={{ color:COLORS.muted, fontSize:13 }}>{l}</span>
                <span style={{ color:COLORS.text, fontSize:13, fontWeight:600 }}>{v||"—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {client?.assessedAt && (
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:700, color:COLORS.text, fontSize:16, marginBottom:10 }}>Last Assessment</div>
          <div style={{ fontSize:12, color:COLORS.muted, marginBottom:12 }}>{new Date(client.assessedAt).toLocaleDateString("en-US",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}</div>
          {client.issues?.length>0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", marginBottom:8, letterSpacing:1 }}>FLAGGED ISSUES</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {client.issues.map(id=>{ const issue=POSTURE_ISSUES.find(i=>i.id===id); return issue?<Badge key={id} label={issue.label} color={COLORS.warn}/>:null; })}
              </div>
            </div>
          )}
          {client.notes && (
            <div>
              <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", marginBottom:6, letterSpacing:1 }}>NOTES</div>
              <p style={{ margin:0, fontSize:13, color:COLORS.muted, lineHeight:1.6, background:COLORS.surface, borderRadius:8, padding:10 }}>{client.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name:"", age:"", occupation:"", goals:"" });
  const steps = [
    { label:"What's your name?",          key:"name",       placeholder:"Full name",                             hint:"We'll personalize your experience" },
    { label:"Your age?",                  key:"age",        placeholder:"e.g. 34", type:"number",                hint:"Helps tailor exercise recommendations" },
    { label:"What's your occupation?",    key:"occupation", placeholder:"e.g. Desk worker, Nurse, Tradesperson",  hint:"Occupational demands shape posture patterns" },
    { label:"What are your goals?",       key:"goals",      placeholder:"e.g. Reduce lower back pain, improve posture", hint:"Tell us what you'd like to improve" },
  ];
  const current = steps[step];
  return (
    <div style={{ minHeight:"100dvh", background:COLORS.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🦴</div>
          <div style={{ fontSize:11, color:COLORS.muted, fontFamily:"monospace", letterSpacing:3, marginBottom:8 }}>POSTURE ALIGN</div>
          <div style={{ fontSize:22, fontWeight:900, color:COLORS.text }}>Let's get you set up</div>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:32 }}>
          {steps.map((_,i)=><div key={i} style={{ flex:1, height:4, borderRadius:2, background:i<=step?COLORS.accent:COLORS.border, transition:"background 0.3s" }}/>)}
        </div>
        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:20, padding:28 }}>
          <div style={{ fontSize:18, fontWeight:800, color:COLORS.text, marginBottom:6 }}>{current.label}</div>
          <div style={{ fontSize:13, color:COLORS.muted, marginBottom:20 }}>{current.hint}</div>
          <input type={current.type||"text"} value={form[current.key]} onChange={e=>setForm({...form,[current.key]:e.target.value})} placeholder={current.placeholder}
            style={{ width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"14px 16px", color:COLORS.text, fontSize:16, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }}/>
          <button onClick={()=>step<steps.length-1?setStep(step+1):onComplete(form)} disabled={!form[current.key]}
            style={{ marginTop:16, width:"100%", background:form[current.key]?COLORS.accent:COLORS.border, color:form[current.key]?"#000":COLORS.muted, fontWeight:900, fontSize:16, border:"none", borderRadius:12, padding:16, cursor:form[current.key]?"pointer":"not-allowed", transition:"all 0.2s" }}>
            {step<steps.length-1?"Continue →":"Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────────

export default function App() {
  const STORAGE_KEY = "posture_align_data";
  function loadData() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
  function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  const saved = loadData();
  const [client, setClient] = useState(saved.client || null);
  const [screen, setScreen] = useState("home");
  const [program, setProgram] = useState(saved.program || []);
  function handleOnboard(form) { const c = { ...form, id:Date.now().toString(), createdAt:new Date() }; setClient(c); saveData({ client: c, program: [] }); }
  function addToProgram(ex, region) { const updated = program.some(p=>p.ex.id===ex.id) ? program : [...program, {ex, region}]; setProgram(updated); saveData({ client, program: updated }); }
  function removeFromProgram(exId) { const updated = program.filter(p=>p.ex.id!==exId); setProgram(updated); saveData({ client, program: updated }); }

  if (!client) return <Onboarding onComplete={handleOnboard}/>;

  const NAV = [
    { id:"home",       icon:"🏠", label:"Home"    },
    { id:"assessment", icon:"📋", label:"Assess"  },
    { id:"massage",    icon:"💆", label:"Massage" },
    { id:"library",    icon:"🏋️", label:"Library" },
    { id:"program",    icon:"📝", label:"Program" },
  ];

  return (
    <div style={{ background:COLORS.bg, minHeight:"100dvh", maxWidth:480, margin:"0 auto", fontFamily:"'Segoe UI', system-ui, sans-serif", color:COLORS.text }}>
      <div style={{ position:"sticky", top:0, background:COLORS.bg+"ee", backdropFilter:"blur(10px)", borderBottom:`1px solid ${COLORS.border}`, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:10 }}>
        <div style={{ fontSize:11, fontFamily:"monospace", color:COLORS.accent, letterSpacing:2 }}>POSTURE ALIGN</div>
        <div style={{ fontSize:13, color:COLORS.muted }}>{client?.name?.split(" ")[0]}</div>
      </div>

      <div style={{ paddingBottom:80 }}>
        {screen==="home"       && <HomeScreen       client={client} onNavigate={setScreen}/>}
        {screen==="assessment" && <AssessmentScreen client={client} onSave={updateClient}/>}
        {screen==="massage"    && <MassageScreen    client={client}/>}
        {screen==="library"    && <LibraryScreen    client={client} onAddToProgram={addToProgram} program={program}/>}
        {screen==="program"    && <ProgramScreen    program={program} onRemove={removeFromProgram}/>}
        {screen==="profile"    && <ProfileScreen    client={client} onUpdate={updateClient}/>}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:COLORS.surface, borderTop:`1px solid ${COLORS.border}`, display:"flex", padding:"8px 0 12px", zIndex:10 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, color:screen===n.id?COLORS.accent:COLORS.muted, fontWeight:screen===n.id?700:400, transition:"color 0.2s" }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
