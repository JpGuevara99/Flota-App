import { prisma } from "../src/lib/prisma.js";

const addDays = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const subtractDays = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

async function main() {
  // idempotent-ish seed: wipe and recreate
  await prisma.historyLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.vehicle.deleteMany();

  const vehicles = await prisma.vehicle.createMany({
    data: [
      { type: "Camioneta", project: "Proyecto Norte", year: 2022, model: "Hilux", brand: "Toyota", licensePlate: "ABCD-12" },
      { type: "Furgón", project: "Proyecto Sur", year: 2021, model: "NQR", brand: "Chevrolet", licensePlate: "EFGH-34" },
      { type: "Furgón", project: "Proyecto Centro", year: 2023, model: "Sprinter", brand: "Mercedes-Benz", licensePlate: "IJKL-56" },
      { type: "Camioneta", project: "Proyecto Norte", year: 2020, model: "Ranger", brand: "Ford", licensePlate: "MNOP-78" },
      { type: "Auto", project: "Proyecto Sur", year: 2019, model: "FRR", brand: "Isuzu", licensePlate: "QRST-90" },
      { type: "Camioneta", project: "Proyecto Este", year: 2022, model: "D-Max", brand: "Isuzu", licensePlate: "UVWX-12" },
    ],
  });

  // Fetch back to get ids
  const v = await prisma.vehicle.findMany();
  const byPlate = new Map(v.map((x) => [x.licensePlate, x]));

  const docs = [
    // ABCD-12
    { plate: "ABCD-12", name: "Permiso de Circulación", type: "permiso_circulacion", expirationDate: addDays(45), issueDate: subtractDays(320), renewalFrequency: "Anual" },
    { plate: "ABCD-12", name: "Revisión Técnica", type: "revision_tecnica", expirationDate: addDays(12), issueDate: subtractDays(168), renewalFrequency: "Semestral" },
    { plate: "ABCD-12", name: "Emisión Contaminantes", type: "emision_contaminantes", expirationDate: addDays(12), issueDate: subtractDays(168), renewalFrequency: "Semestral" },
    { plate: "ABCD-12", name: "SOAP", type: "soap", expirationDate: addDays(90), issueDate: subtractDays(275), renewalFrequency: "Anual" },
    { plate: "ABCD-12", name: "Mantención General", type: "mantencion_general", expirationDate: addDays(60), issueDate: subtractDays(30), renewalFrequency: "Variable" },
    // EFGH-34
    { plate: "EFGH-34", name: "Permiso de Circulación", type: "permiso_circulacion", expirationDate: addDays(25), issueDate: subtractDays(340), renewalFrequency: "Anual" },
    { plate: "EFGH-34", name: "Revisión Técnica", type: "revision_tecnica", expirationDate: addDays(5), issueDate: subtractDays(175), renewalFrequency: "Semestral" },
    { plate: "EFGH-34", name: "Emisión Contaminantes", type: "emision_contaminantes", expirationDate: addDays(5), issueDate: subtractDays(175), renewalFrequency: "Semestral" },
    { plate: "EFGH-34", name: "SOAP", type: "soap", expirationDate: addDays(180), issueDate: subtractDays(185), renewalFrequency: "Anual" },
    { plate: "EFGH-34", name: "Mantención General", type: "mantencion_general", expirationDate: subtractDays(3), issueDate: subtractDays(93), renewalFrequency: "Variable" },
    // IJKL-56
    { plate: "IJKL-56", name: "Permiso de Circulación", type: "permiso_circulacion", expirationDate: addDays(120), issueDate: subtractDays(245), renewalFrequency: "Anual" },
    { plate: "IJKL-56", name: "Revisión Técnica", type: "revision_tecnica", expirationDate: addDays(75), issueDate: subtractDays(105), renewalFrequency: "Semestral" },
    { plate: "IJKL-56", name: "Emisión Contaminantes", type: "emision_contaminantes", expirationDate: addDays(75), issueDate: subtractDays(105), renewalFrequency: "Semestral" },
    { plate: "IJKL-56", name: "SOAP", type: "soap", expirationDate: addDays(200), issueDate: subtractDays(165), renewalFrequency: "Anual" },
    { plate: "IJKL-56", name: "Mantención General", type: "mantencion_general", expirationDate: addDays(40), issueDate: subtractDays(50), renewalFrequency: "Variable" },
    // MNOP-78
    { plate: "MNOP-78", name: "Permiso de Circulación", type: "permiso_circulacion", expirationDate: subtractDays(5), issueDate: subtractDays(370), renewalFrequency: "Anual" },
    { plate: "MNOP-78", name: "Revisión Técnica", type: "revision_tecnica", expirationDate: addDays(28), issueDate: subtractDays(152), renewalFrequency: "Semestral" },
    { plate: "MNOP-78", name: "Emisión Contaminantes", type: "emision_contaminantes", expirationDate: addDays(28), issueDate: subtractDays(152), renewalFrequency: "Semestral" },
    { plate: "MNOP-78", name: "SOAP", type: "soap", expirationDate: addDays(150), issueDate: subtractDays(215), renewalFrequency: "Anual" },
    { plate: "MNOP-78", name: "Mantención General", type: "mantencion_general", expirationDate: addDays(10), issueDate: subtractDays(80), renewalFrequency: "Variable" },
    // QRST-90
    { plate: "QRST-90", name: "Permiso de Circulación", type: "permiso_circulacion", expirationDate: addDays(60), issueDate: subtractDays(305), renewalFrequency: "Anual" },
    { plate: "QRST-90", name: "Revisión Técnica", type: "revision_tecnica", expirationDate: addDays(45), issueDate: subtractDays(135), renewalFrequency: "Semestral" },
    { plate: "QRST-90", name: "Emisión Contaminantes", type: "emision_contaminantes", expirationDate: addDays(45), issueDate: subtractDays(135), renewalFrequency: "Semestral" },
    { plate: "QRST-90", name: "SOAP", type: "soap", expirationDate: addDays(100), issueDate: subtractDays(265), renewalFrequency: "Anual" },
    { plate: "QRST-90", name: "Mantención General", type: "mantencion_general", expirationDate: addDays(85), issueDate: subtractDays(5), renewalFrequency: "Variable" },
    // UVWX-12
    { plate: "UVWX-12", name: "Permiso de Circulación", type: "permiso_circulacion", expirationDate: addDays(22), issueDate: subtractDays(343), renewalFrequency: "Anual" },
    { plate: "UVWX-12", name: "Revisión Técnica", type: "revision_tecnica", expirationDate: addDays(50), issueDate: subtractDays(130), renewalFrequency: "Semestral" },
    { plate: "UVWX-12", name: "Emisión Contaminantes", type: "emision_contaminantes", expirationDate: addDays(50), issueDate: subtractDays(130), renewalFrequency: "Semestral" },
    { plate: "UVWX-12", name: "SOAP", type: "soap", expirationDate: addDays(200), issueDate: subtractDays(165), renewalFrequency: "Anual" },
    { plate: "UVWX-12", name: "Mantención General", type: "mantencion_general", expirationDate: addDays(70), issueDate: subtractDays(20), renewalFrequency: "Variable" },
  ] as const;

  for (const d of docs) {
    const vehicle = byPlate.get(d.plate);
    if (!vehicle) continue;
    await prisma.document.create({
      data: {
        vehicleId: vehicle.id,
        name: d.name,
        type: d.type,
        expirationDate: d.expirationDate,
        issueDate: d.issueDate,
        renewalFrequency: d.renewalFrequency,
      },
    });
  }

  // a few sample history rows
  const toyota = byPlate.get("ABCD-12");
  const chevy = byPlate.get("EFGH-34");
  const sprinter = byPlate.get("IJKL-56");
  const ford = byPlate.get("MNOP-78");
  const isuzu = byPlate.get("UVWX-12");

  const display = (x: { brand: string; model: string; licensePlate: string }) => `${x.brand} ${x.model} (${x.licensePlate})`;

  if (toyota) {
    await prisma.historyLog.create({
      data: {
        vehicleId: toyota.id,
        vehicleName: display(toyota),
        action: "document_renewed",
        field: "Revisión Técnica",
        oldValue: "2024-06-15",
        newValue: "2025-01-15",
        details: "Renovación de certificado de revisión técnica",
        timestamp: subtractDays(30),
        user: "Admin",
      },
    });
  }
  if (chevy) {
    await prisma.historyLog.create({
      data: {
        vehicleId: chevy.id,
        vehicleName: display(chevy),
        action: "vehicle_updated",
        field: "project",
        oldValue: "Proyecto Este",
        newValue: "Proyecto Sur",
        details: "Cambio de asignación de proyecto",
        timestamp: subtractDays(15),
        user: "Admin",
      },
    });
  }
  if (sprinter) {
    await prisma.historyLog.create({
      data: {
        vehicleId: sprinter.id,
        vehicleName: display(sprinter),
        action: "vehicle_created",
        details: "Nuevo vehículo agregado al sistema",
        timestamp: subtractDays(60),
        user: "Admin",
      },
    });
  }
  if (ford) {
    await prisma.historyLog.create({
      data: {
        vehicleId: ford.id,
        vehicleName: display(ford),
        action: "document_added",
        field: "SOAP",
        details: "Seguro obligatorio agregado al vehículo",
        timestamp: subtractDays(45),
        user: "Admin",
      },
    });
  }
  if (isuzu) {
    await prisma.historyLog.create({
      data: {
        vehicleId: isuzu.id,
        vehicleName: display(isuzu),
        action: "vehicle_created",
        details: "Nuevo vehículo agregado al sistema",
        timestamp: subtractDays(120),
        user: "Admin",
      },
    });
  }

  console.log(`Seeded ${vehicles.count} vehicles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

