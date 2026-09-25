// Connected systems layered on the original simulation. All changes remain local to a save.
function ensureSystems() {
  if (!s) return;
  s.player.actions ??= 3;
  s.player.jailed ??= 0;
  s.player.arrests ??= 0;
  s.player.convictions ??= 0;
  s.player.intelligence ??= 64;
  s.player.charisma ??= 61;
  s.player.discipline ??= 69;
  s.player.difficulty ??= 'Standard';
  s.player.background ??= 'Working Class';
  s.flags ??= {};
  s.notifications ??= [];
  s.opportunities ??= [0,1,2,3,4];
  s.familySituation ??= 0;
  s.familySituationPerson ??= 0;
}
function refreshOpportunities() {
  const pool = jobs.map((_,i) => i);
  s.opportunities = [];
  while (s.opportunities.length < 5 && pool.length) {
    s.opportunities.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  }
  s.familySituation = Math.floor(Math.random()*relationshipSituations.length);
  s.familySituationPerson = Math.floor(Math.random()*Math.max(1,s.family.length+s.children.length));
}
ensureSystems();

const baseEventMake = eventMake;
eventMake = function () {
  ensureSystems();
  const eligible = eventTemplates.map((template,i) => ({template,i})).filter(({template,i}) => {
    const title = template[0].toLowerCase();
    if (s.flags['recentEvent'+i] && s.turn - s.flags['recentEvent'+i] < 18) return false;
    if ((title.includes('school') || title.includes('succession plan') || title.includes('new generation')) && !s.children.length) return false;
    if ((title.includes('manager') || title.includes('business at') || title.includes('books need')) && !s.businesses.length) return false;
    if ((title.includes('crew member') || title.includes('leadership opening')) && !s.crew.length) return false;
    return true;
  });
  if (!eligible.length) return baseEventMake();
  const {template,i} = pick(eligible);
  s.flags['recentEvent'+i] = s.turn;
  let body = template[1];
  if (template[0] === 'A long memory' && s.flags.keptPromise) {
    body = 'Someone remembers the promise you kept years ago. They have returned with a chance to work together.';
  }
  return {title:template[0],body,choices:template[2],index:i};
};

const baseAdvance = advance;
advance = function (monthsToAdvance = 1) {
  ensureSystems();
  if (s.event && !s.event.death) {
    toast('Resolve the current decision before advancing.');
    return;
  }
  if (s.player.retired || !s.player.alive) {
    s.screen = 'Dynasty';
    render();
    return;
  }
  for (let month = 0; month < monthsToAdvance; month++) {
    baseAdvance(1);
    if (!s.player.alive) break;
    const p = s.player;
    p.actions = p.jailed > 0 ? 0 : 3;
    refreshOpportunities();
    if (p.jailed > 0) {
      p.jailed--;
      if (p.jailed === 0) log('legal', p.name + ' returned home after a prison sentence.');
      s.event = {
        kind: 'prison',
        title: 'A month away',
        body: 'The city and your family continue without you. Letters and updates offer a chance to stay connected.',
        choices: ['Write to family', 'Check on the businesses', 'Reflect quietly']
      };
    }
    const difficulty = p.difficulty === 'Hard' ? 1.35 : p.difficulty === 'Story' ? .75 : 1;
    const pressure = s.crew.length * .28 + s.districts.reduce((n,d) => n + d.heat, 0) / 80;
    s.investigations.local = Math.max(0,Math.min(100,s.investigations.local + pressure * difficulty));
    s.investigations.organized = Math.max(0,Math.min(100,s.investigations.organized + Math.max(0,p.rep-35) * .006 * difficulty));
    s.investigations.federal = Math.max(0,Math.min(100,s.investigations.federal + (s.businesses.length > 3 ? .18 : 0) * difficulty));
    p.heat = Math.round((s.investigations.local + s.investigations.organized + s.investigations.federal)/3);
    if (!s.flags.backgroundApplied) {
      if (p.background === 'Family Connections') p.loyalty += 9;
      if (p.background === 'Street Raised') p.rep += 7;
      if (p.background === 'Business Family') p.cash += 2600;
      if (p.background === 'Troubled Home') {p.stress += 8;p.discipline = 72}
      if (p.background === 'Ambitious Outsider') p.influence += 6;
      s.flags.backgroundApplied = true;
    }
    if (s.investigations.local > 32 && Math.random() < .025 * difficulty + s.investigations.local / 1800) {
      s.event = {
        kind: 'legal',
        title: 'Questions from the city',
        body: 'An attorney says investigators are reviewing your affairs. A careful response will cost time and money.',
        choices: ['Work through counsel', 'Cooperate with the review', 'Contest the allegations']
      };
      log('legal', 'An investigation became an immediate concern.');
    }
    if (s.event) break;
  }
  save();
  render();
};

const baseResolve = resolve;
resolve = function (choice) {
  ensureSystems();
  const event = s.event;
  if (event?.kind === 'legal') {
    const p = s.player;
    const costs = [2300,600,900];
    p.cash -= Math.min(Math.max(0,p.cash),costs[choice]);
    const evidence = (s.investigations.local * .45 + s.investigations.organized * .35 + s.investigations.federal * .2) / 100;
    const protection = [0.25,0.16,0.08][choice];
    const conviction = Math.random() < Math.max(.04,evidence - protection);
    if (conviction) {
      p.arrests++;
      p.convictions++;
      p.jailed = 6 + Math.floor(Math.random() * 13);
      p.rep = Math.max(0,p.rep-7);
      s.crew.forEach(c => c.loyalty = Math.max(0,c.loyalty-5));
      log('legal', p.name + ' was convicted and sentenced to ' + p.jailed + ' months.');
      toast('A conviction changed the course of your life.');
    } else {
      s.investigations.local = Math.max(0,s.investigations.local-18);
      log('legal', 'The immediate legal matter closed without a conviction.');
      toast('The immediate matter has closed.');
    }
    s.event = null;
    save();
    render();
    return;
  }
  if (event?.kind === 'prison') {
    if (choice === 0) s.family.forEach(f => f.closeness = Math.min(100,f.closeness+3));
    if (choice === 1) s.businesses.forEach(b => b.income = Math.round(b.income * 1.01));
    if (choice === 2) s.player.stress = Math.max(0,s.player.stress-5);
    log('legal', 'Time passed during a prison sentence.');
    s.event = null;
    save();
    render();
    return;
  }
  const title = event?.title;
  baseResolve(choice);
  if (title === 'An old promise') s.flags.keptPromise = choice === 0;
  if (title === 'A family request' && choice < 2 && s.family.length) {
    s.family[0].closeness = Math.min(100,s.family[0].closeness+8);
  }
  if (title === 'A rival’s invitation' && choice === 0) {
    s.rivals[0].hostility = Math.max(0,s.rivals[0].hostility-10);
    s.rivals[0].relation = 'Friendly';
  }
  if (title === 'A crew member’s milestone' && choice < 2 && s.crew.length) {
    s.crew[0].loyalty = Math.min(100,s.crew[0].loyalty+10);
  }
  save();
  render();
};

const baseAct = act;
act = function (command) {
  ensureSystems();
  const [kind,id] = command.split(':');
  const noCost = kind === 'retire' || kind === 'successor';
  if (!noCost && s.player.jailed > 0) {
    toast('Your options are limited while you are incarcerated.');
    return;
  }
  if (!noCost && s.player.actions <= 0) {
    toast('Your month is full. Advance time for more actions.');
    return;
  }
  const p = s.player;
  let changed = false;
  if (kind === 'upgrade') {
    const b = s.businesses.find(x => x.id === id);
    const cost = Math.round(b.price * .35);
    if (p.cash < cost) return toast('Not enough cash for an upgrade.');
    p.cash -= cost;
    b.value += Math.round(cost * .8);
    b.income = Math.round(b.income * 1.14);
    b.cost = Math.round(b.cost * 1.05);
    log('business', b.name + ' was upgraded.');
    toast(b.name + ' was upgraded.');
    changed = true;
  } else if (kind === 'manager') {
    const b = s.businesses.find(x => x.id === id);
    if (p.cash < 1200) return toast('A manager appointment costs $1,200.');
    p.cash -= 1200;
    b.manager = pick(first) + ' ' + pick(last);
    b.income = Math.round(b.income * 1.08);
    log('business', b.manager + ' was appointed to manage ' + b.name + '.');
    toast('Manager appointed.');
    changed = true;
  } else if (kind === 'job') {
    const index = Number(id);
    if (!s.opportunities.includes(index)) return toast('This opportunity has passed.');
    const [title,reward,risk,type] = jobs[index];
    const aptitude = type === 'legitimate' ? p.intelligence : p.discipline;
    const success = Math.random() * 100 < Math.min(92,68 + aptitude * .18 - risk);
    if (success) {
      p.cash += reward;
      p.rep += type === 'organization' ? 2 : 1;
      if (type === 'legitimate') p.influence += 1;
      toast('The arrangement paid ' + cash(reward) + '.');
      log(type === 'organization' ? 'organization' : 'business',title + ' was completed.');
    } else {
      p.stress = Math.min(100,p.stress+5);
      toast('The arrangement fell through.');
      log('business',title + ' fell through.');
    }
    if (type === 'organization') s.investigations.local = Math.min(100,s.investigations.local + risk * .45);
    s.opportunities = s.opportunities.filter(x => x !== index);
    changed = true;
  } else if (kind === 'relationship') {
    const relative = [...s.family,...s.children][s.familySituationPerson];
    if (!relative) return toast('No family relationship is available.');
    const choice = Number(id);
    if (choice === 0) {
      relative.closeness = Math.min(100,relative.closeness+10);
      relative.trust = Math.min(100,relative.trust+5);
      p.happiness = Math.min(100,p.happiness+3);
    } else if (choice === 1) {
      if (p.cash < 500) return toast('You need $500 to help financially.');
      p.cash -= 500;
      relative.closeness = Math.min(100,relative.closeness+6);
      relative.trust = Math.min(100,relative.trust+7);
    } else {
      relative.closeness = Math.max(0,relative.closeness-4);
      relative.resentment = (relative.resentment||0)+5;
      p.stress = Math.max(0,p.stress-2);
    }
    const situation = relationshipSituations[s.familySituation];
    s.flags['relationship'+s.turn] = {title:situation[0],choice,person:relative.name};
    log('family',situation[0] + ': ' + relative.name + ' will remember how you responded.');
    s.familySituation = -1;
    toast('The conversation will be remembered.');
    changed = true;
  } else if (kind === 'diplomacy') {
    const r = s.rivals[Number(id)];
    if (p.cash < 700) return toast('A meeting costs $700.');
    p.cash -= 700;
    r.hostility = Math.max(0,r.hostility-12);
    r.relation = r.hostility < 20 ? 'Friendly' : r.hostility < 40 ? 'Neutral' : 'Tense';
    p.respect += 1;
    log('organization', 'Held a careful meeting with ' + r.name + '.');
    toast('The meeting eased tensions.');
    changed = true;
  } else {
    const before = JSON.stringify(s);
    baseAct(command);
    changed = before !== JSON.stringify(s);
  }
  if (changed && !noCost) {
    p.actions--;
    save();
    render();
  } else if (changed) {
    save();
    render();
  }
};

const baseScreen = screen;
screen = function () {
  ensureSystems();
  let output = baseScreen();
  if (s.screen === 'Life') {
    output += card('Time available', stats([['Actions left',s.player.actions],['Legal record',s.player.convictions],['Months detained',s.player.jailed]]));
    output += card('Opportunities this month','<p>Choose a limited number of arrangements. Each has a payout and a degree of pressure.</p><div class="list">' +
      s.opportunities.map(i => {
        const [title,reward,risk,type] = jobs[i];
        return entry(title,'<small>' + type + ' · Reward ' + cash(reward) + ' · Pressure ' + risk + '</small>',
          btn('Take opportunity','job:'+i));
      }).join('') + '</div>');
  }
  if (s.screen === 'Business' && s.businesses.length) {
    output += card('Manage your holdings','<div class="list">' + s.businesses.map(b =>
      entry(b.name,'<small>Manager ' + b.manager + ' · Net ' + cash(b.income-b.cost) + '/mo</small>',
        '<div class="actions">' + btn('Upgrade · ' + cash(b.price*.35),'upgrade:'+b.id) +
        btn('Appoint manager · $1,200','manager:'+b.id) + '</div>')).join('') + '</div>');
  }
  if (s.screen === 'City') {
    output += card('Rival diplomacy','<p>Meet rival leadership to ease hostility and build room for agreements.</p><div class="list">' +
      s.rivals.map((r,i) => entry(r.name + ' <span class="pill">' + r.relation + '</span>',
      '<small>Hostility ' + r.hostility + '%</small>',btn('Arrange meeting · $700','diplomacy:'+i))).join('') + '</div>');
  }
  if (s.screen === 'Money') {
    output += card('Legal record',stats([['Arrests',s.player.arrests],['Convictions',s.player.convictions],['Months detained',s.player.jailed],['Actions left',s.player.actions]]));
  }
  if (s.screen === 'Family' && s.familySituation >= 0) {
    const situation = relationshipSituations[s.familySituation];
    const relative = [...s.family,...s.children][s.familySituationPerson];
    output += card(situation[0],'<p>' + situation[1] + '</p><p class="muted">Involves ' + (relative?.name||'your family') + '.</p><div class="actions">' +
      btn('Make time','relationship:0','') +
      btn('Offer $500','relationship:1') +
      btn('Give them space','relationship:2') + '</div>');
  }
  return output;
};
render();
