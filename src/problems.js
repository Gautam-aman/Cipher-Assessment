export const problems = [
  {
    id: 'parking-lot', title: 'Parking lot', category: 'Resource allocation', level: 'Foundations', minutes: 25,
    summary: 'Design a multi-level parking facility that assigns a compatible spot and calculates a fee when a vehicle leaves.',
    requirements: ['Support motorcycles, cars, and buses across multiple levels.', 'Issue a ticket when a vehicle enters and prevent double parking.', 'Calculate fees from duration and vehicle type; keep pricing open to change.'],
    extension: 'A new electric vehicle type needs charging spots, and pricing now varies by day of week.'
  },
  {
    id: 'vending-machine', title: 'Vending machine', category: 'State & transactions', level: 'Foundations', minutes: 20,
    summary: 'Model a vending machine that accepts payment, dispenses products, and handles the awkward moments safely.',
    requirements: ['Track inventory and reject out-of-stock selections.', 'Accept payment, return change, and dispense exactly once.', 'Support cancellation and refund when a purchase cannot complete.'],
    extension: 'The machine adds card payments and a maintenance mode that can safely restock it.'
  },
  {
    id: 'elevator', title: 'Elevator system', category: 'Scheduling & state', level: 'Stretch', minutes: 30,
    summary: 'Design a small building elevator controller that groups requests and moves safely between floors.',
    requirements: ['Represent multiple elevators and floor requests.', 'Choose an elevator using an explicit, replaceable policy.', 'Respect capacity and door state while serving requests.'],
    extension: 'Add priority requests and take one elevator out of service without losing queued work.'
  }
];
