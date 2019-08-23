// TODO: Make all this configurable - with thresholds
// TODO: Create a auto-balance kitten jobs according to needs...
//     - Use heavy toggles
//     - Minimize farmers with thought of winter issues

const checkRate = 3; // seconds

const autocraft = {
  parchment: false,
  beam: false
};

function log(...args) {
  console.log('KITTENS:', ...args);
}

function craftAll(resource) {
  const row = [...document.querySelectorAll('.craftTable .resource-name')].find(
    el => el.innerText === resource
  );
  const containers = [...row.parentElement.children];
  const button = containers[containers.length - 1].children[0];
  return {
    withThreshold: function(type, amount = 1) {
      if (
        button &&
        button.innerText === 'all' &&
        (!type || game.resPool.resourceMap[type].value >= amount)
      ) {
        log('Crafting all', resource);
        button.click();
      }
    }
  };
}

function res(name) {
  return game.resPool.resourceMap[name].value;
}

function isResourceAtMax(name) {
  return (
    game.resPool.resourceMap[name].value ===
    game.resPool.resourceMap[name].maxValue
  );
}

function balanceKittens(weights) {
  const total = game.village.getKittens();
  const jobs = game.village.jobs.filter(job => job.unlocked);

  game.village.clearJobs();

  const weightCounts = {};

  let left = total;

  Object.keys(weights).forEach(key => {
    const count = Math.floor(weights[key] * total);
    weightCounts[key] = count;
    left = Math.max(0, left - count);
  });

  const auto = Math.floor(left / (jobs.length - Object.keys(weights).length));

  jobs.forEach(job => {
    const count = weightCounts[job.name] || auto;
    if (count > 0) {
      log('Assigning', count, 'jobs to', job.name);
      game.village.assignJob(job, count);
    }
  });
}

function sendHunters() {
  const el = document.querySelector('#fastHuntContainerCount');
  if (!el) return;
  const count = parseInt(el.innerText);
  if (el && count > 20) {
    log('Sending hunters');
    el.click();
  }
}

function tradeCatnipForWood() {
  // TODO: Make sure catnip production rate is positive!
  if (isResourceAtMax('catnip')) {
    log('Trading catnip');
    craftAll('wood').withThreshold(false);
  }
}

function observeSky() {
  const el = document.querySelector('#observeButton input');
  if (el) {
    log('Observing the sky');
    el.click();
  }
}

function fixHappiness() {
  // send hunter if possible, just once
  // how do we know we are not at max??
}

function flash(color) {
  const body = document.body;
  const originalColor = window.getComputedStyle(body).backgroundColor;
  body.style.backgroundColor = color;
  setTimeout(() => {
    body.style.backgroundColor = originalColor;
  }, 500);
}

function catnipLowAlert() {
  if (!isResourceAtMax('kittens')) return;
  const before = res('catnip');
  setTimeout(() => {
    const after = res('catnip');
    const diff = after - before;
    if (diff < 0) {
      const secondsUntilZero = after / -diff;
      if (secondsUntilZero < 30) {
        flash('yellow');
      }
    }
  }, 1000);
}

function populationAlert() {
  // if kittens not at max, alert!
  if (!isResourceAtMax('kittens')) {
    flash('red');
  }
}

window.addEventListener(
  'action',
  function(data) {
    log(data.detail);
    const { type, threshold } = data.detail;
    autocraft[type] = threshold;
    log(autocraft);
  },
  false
);

function tryAutocraft(name, res) {
  if (autocraft[name] !== false) {
    craftAll(name).withThreshold(res, autocraft[name]);
  }
}

function checks() {
  sendHunters();
  tradeCatnipForWood();
  observeSky();

  // craftAll('parchment').withThreshold(false);
  // craftAll('beam').withThreshold('wood', 20000);
  tryAutocraft('parchment', 'furs');
  tryAutocraft('beam', 'wood');

  craftAll('scaffold').withThreshold('beam', 1000);
  // craftAll('plate').withThreshold('iron', 5000);
  craftAll('steel').withThreshold('coal', 1000);
  // craftAll('slab').withThreshold('minerals', 25000);
  craftAll('manuscript').withThreshold('culture', 2000);
  catnipLowAlert();
  populationAlert();
}

setInterval(checks, 1000 * checkRate);
