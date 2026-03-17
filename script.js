let vehicleData = [];
let unassignedLocations = [];

document.getElementById("allocateBtn").addEventListener("click", function () {
  const locations = parseInt(document.getElementById("locations").value);
  const vehicles = parseInt(document.getElementById("vehicles").value);
  const maxTime = parseFloat(document.getElementById("maxTime").value);

  if (locations <= 0 || vehicles <= 0 || maxTime <= 0) {
    document.getElementById("result").innerHTML =
      "<p>Please enter valid values for all fields.</p>";
    return;
  }

  vehicleData = [];
  unassignedLocations = [];

  const perVehicle = Math.floor(locations / vehicles);
  const extra = locations % vehicles;

  let currentLocationNumber = 1;

  for (let i = 1; i <= vehicles; i++) {
    let assigned = perVehicle;
    if (i <= extra) assigned += 1;

    let orderedLocations = [];
    for (let loc = currentLocationNumber; loc < currentLocationNumber + assigned; loc++) {
      orderedLocations.push(`L${loc}`);
    }

    let estimatedTime = parseFloat((2.08 + Math.random() * 0.55).toFixed(2));
    const estimatedDistance = parseFloat((35 + Math.random() * 30).toFixed(1));

    if (estimatedTime > maxTime) {
      while (estimatedTime > maxTime && orderedLocations.length > 0) {
        const removed = orderedLocations.pop();
        unassignedLocations.push(removed);
        estimatedTime = parseFloat((estimatedTime - 0.05).toFixed(2));
      }
    }

    vehicleData.push({
      vehicle: i,
      assigned: orderedLocations.length,
      startLocation: orderedLocations.length ? orderedLocations[0] : "-",
      endLocation: orderedLocations.length
        ? orderedLocations[orderedLocations.length - 1]
        : "-",
      estimatedTime,
      estimatedDistance,
      urgentAssigned: null,
      orderedLocations
    });

    currentLocationNumber += assigned;
  }

  displayVehicles(maxTime);
  updateStats();
});

document.getElementById("urgentBtn").addEventListener("click", function () {
  const urgentLocation = parseInt(document.getElementById("urgentLocation").value);
  const maxTime = parseFloat(document.getElementById("maxTime").value);

  if (vehicleData.length === 0) {
    document.getElementById("result").innerHTML =
      "<p>Please allocate deliveries first.</p>";
    return;
  }

  if (!urgentLocation || urgentLocation <= 0) {
    document.getElementById("result").innerHTML =
      "<p>Please enter a valid urgent location number.</p>";
    return;
  }

  const urgentLabel = `L${urgentLocation}`;
  let chosenVehicle = null;
  let leastExtraTime = Infinity;

  for (const v of vehicleData) {
    const extraTime = parseFloat((0.08 + Math.random() * 0.22).toFixed(2));
    const newTime = v.estimatedTime + extraTime;

    if (newTime <= maxTime && extraTime < leastExtraTime) {
      leastExtraTime = extraTime;
      chosenVehicle = v;
    }
  }

  if (chosenVehicle) {
    if (!chosenVehicle.orderedLocations.includes(urgentLabel)) {
      const insertPos =
        chosenVehicle.orderedLocations.length >= 2
          ? 2
          : chosenVehicle.orderedLocations.length;

      chosenVehicle.orderedLocations.splice(insertPos, 0, urgentLabel);
    }

    chosenVehicle.urgentAssigned = urgentLabel;
    chosenVehicle.estimatedTime = parseFloat(
      (chosenVehicle.estimatedTime + leastExtraTime).toFixed(2)
    );
    chosenVehicle.assigned = chosenVehicle.orderedLocations.length;
    chosenVehicle.startLocation = chosenVehicle.orderedLocations[0];
    chosenVehicle.endLocation =
      chosenVehicle.orderedLocations[chosenVehicle.orderedLocations.length - 1];

    displayVehicles(
      maxTime,
      `Urgent delivery ${urgentLabel} assigned to Vehicle ${chosenVehicle.vehicle}.`
    );
  } else {
    unassignedLocations.push(urgentLabel);
    displayVehicles(
      maxTime,
      `Urgent delivery ${urgentLabel} could not be assigned and is marked as unassigned.`
    );
  }

  updateStats();
});

function displayVehicles(maxTime, message = "") {
  let output = `
    <div class="summary-box">
      <p><strong>Max Route Time:</strong> ${maxTime} hours</p>
      ${message ? `<p><strong>Status:</strong> ${message}</p>` : ""}
      <p><strong>Total Unassigned Locations:</strong> ${unassignedLocations.length}</p>
    </div>
    <div class="vehicle-grid">
  `;

  vehicleData.forEach((v) => {
    const routeText = `Warehouse → ${v.orderedLocations.join(" → ")} → Warehouse`;

    output += `
      <div class="vehicle-card">
        <h3>Vehicle ${String(v.vehicle).padStart(2, "0")}</h3>
        <p><strong>Assigned Locations:</strong> ${v.assigned}</p>
        <p><strong>Start:</strong> ${v.startLocation}</p>
        <p><strong>End:</strong> ${v.endLocation}</p>
        <p><strong>Estimated Distance:</strong> ${v.estimatedDistance} km</p>
        <p><strong>Estimated Travel Time:</strong> ${v.estimatedTime} hours</p>
        <p><strong>Urgent Delivery:</strong> ${v.urgentAssigned ? v.urgentAssigned : "No"}</p>
        <span class="route-tag">${routeText}</span>
      </div>
    `;
  });

  output += `</div>`;

  if (unassignedLocations.length > 0) {
    output += `
      <div class="flow-card" style="margin-top:20px;">
        <h2>Unassigned Locations</h2>
        <p>${unassignedLocations.join(", ")}</p>
      </div>
    `;
  }

  document.getElementById("result").innerHTML = output;
}

function updateStats() {
  const locations = document.getElementById("locations").value || 0;
  const vehicles = document.getElementById("vehicles").value || 0;
  const maxTime = document.getElementById("maxTime").value || 0;

  document.getElementById("statLocations").textContent = locations;
  document.getElementById("statVehicles").textContent = vehicles;
  document.getElementById("statMaxTime").textContent = `${maxTime} hrs`;
  document.getElementById("statUnassigned").textContent = unassignedLocations.length;
}

updateStats();