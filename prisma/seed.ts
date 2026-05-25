import bcrypt from "bcryptjs";
import { PrismaClient, type PlantDifficulty, type PlantStageKey } from "@prisma/client";

const prisma = new PrismaClient();

type StageSeed = {
  title: string;
  description: string;
  stageKey: PlantStageKey;
  dayFrom: number;
  dayTo: number;
  order: number;
};

type PlantSeed = {
  name: string;
  type: string;
  difficulty: PlantDifficulty;
  description: string;
  lightRequirement: string;
  waterRequirement: string;
  averageGerminationDays: number;
  averageHarvestDays: number;
  recommendedContainer: string;
  sowingDepth?: string | null;
  temperature?: string | null;
  stages: StageSeed[];
};

const basilStages: StageSeed[] = [
  {
    title: "Посев",
    description: "Посейте семена неглубоко, увлажните землю и накройте плёнкой или крышкой.",
    stageKey: "SOWING",
    dayFrom: 1,
    dayTo: 1,
    order: 1
  },
  {
    title: "Ждём всходы",
    description: "Держите посевы в тепле, каждый день проветривайте и проверяйте влажность.",
    stageKey: "WAITING_FOR_SPROUTS",
    dayFrom: 2,
    dayTo: 10,
    order: 2
  },
  {
    title: "Первые листочки",
    description: "После всходов снимите плёнку и поставьте растение ближе к свету.",
    stageKey: "FIRST_LEAVES",
    dayFrom: 7,
    dayTo: 21,
    order: 3
  },
  {
    title: "Рост куста",
    description: "Поливайте умеренно и поворачивайте горшок, чтобы куст рос ровнее.",
    stageKey: "GROWTH",
    dayFrom: 14,
    dayTo: 35,
    order: 4
  },
  {
    title: "Прищипка",
    description: "Когда появится несколько пар листьев, прищипните верхушку для ветвления.",
    stageKey: "PINCHING",
    dayFrom: 28,
    dayTo: 35,
    order: 5
  },
  {
    title: "Урожай",
    description: "Срезайте верхние листья понемногу, чтобы растение продолжало расти.",
    stageKey: "HARVEST",
    dayFrom: 35,
    dayTo: 50,
    order: 6
  }
];

const commonGreenStages: StageSeed[] = [
  {
    title: "Посев",
    description: "Посейте семена во влажную землю на рекомендованную глубину.",
    stageKey: "SOWING",
    dayFrom: 1,
    dayTo: 1,
    order: 1
  },
  {
    title: "Ожидание всходов",
    description: "Держите посевы в подходящем тепле и не давайте земле пересыхать.",
    stageKey: "WAITING_FOR_SPROUTS",
    dayFrom: 2,
    dayTo: 10,
    order: 2
  },
  {
    title: "Рост",
    description: "Следите за светом и поливом. Земля должна быть слегка влажной, но не мокрой.",
    stageKey: "GROWTH",
    dayFrom: 10,
    dayTo: 35,
    order: 3
  },
  {
    title: "Урожай",
    description: "Срезайте зелень аккуратно, оставляя точку роста, если растение может отрасти снова.",
    stageKey: "HARVEST",
    dayFrom: 30,
    dayTo: 60,
    order: 4
  }
];

const plants: PlantSeed[] = [
  {
    name: "Базилик Арарат",
    type: "пряная зелень",
    difficulty: "EASY",
    description: "Ароматный фиолетово-зелёный базилик для подоконника, балкона и летних блюд.",
    lightRequirement: "любит много света",
    waterRequirement: "умеренный",
    averageGerminationDays: 7,
    averageHarvestDays: 42,
    recommendedContainer: "горшок 1-2 литра или длинный ящик",
    sowingDepth: "0.5 см",
    temperature: "20-25°C",
    stages: basilStages
  },
  {
    name: "Томат черри",
    type: "овощи",
    difficulty: "MEDIUM",
    description: "Компактный томат с маленькими сладкими плодами для солнечного окна или балкона.",
    lightRequirement: "очень много света",
    waterRequirement: "регулярный",
    averageGerminationDays: 7,
    averageHarvestDays: 90,
    recommendedContainer: "от 5 литров",
    sowingDepth: "0.5-1 см",
    temperature: "20-25°C",
    stages: [
      ...commonGreenStages,
      {
        title: "Цветение и плоды",
        description: "Следите за регулярным поливом, светом и подвязкой стебля.",
        stageKey: "HARVEST",
        dayFrom: 60,
        dayTo: 100,
        order: 5
      }
    ]
  },
  {
    name: "Микрозелень редиса",
    type: "микрозелень",
    difficulty: "VERY_EASY",
    description: "Быстрая микрозелень с ярким вкусом. Подходит для самого первого опыта.",
    lightRequirement: "средний",
    waterRequirement: "часто, но немного",
    averageGerminationDays: 2,
    averageHarvestDays: 7,
    recommendedContainer: "неглубокий лоток",
    sowingDepth: null,
    temperature: "18-23°C",
    stages: [
      {
        title: "Посев",
        description: "Распределите семена по влажному коврику или тонкому слою грунта.",
        stageKey: "SOWING",
        dayFrom: 1,
        dayTo: 1,
        order: 1
      },
      {
        title: "Прорастание",
        description: "Держите семена влажными, но не заливайте водой.",
        stageKey: "WAITING_FOR_SPROUTS",
        dayFrom: 2,
        dayTo: 3,
        order: 2
      },
      {
        title: "Рост микрозелени",
        description: "Поставьте лоток на свет и опрыскивайте по мере подсыхания.",
        stageKey: "GROWTH",
        dayFrom: 3,
        dayTo: 6,
        order: 3
      },
      {
        title: "Срезка",
        description: "Срежьте микрозелень чистыми ножницами у основания стеблей.",
        stageKey: "HARVEST",
        dayFrom: 5,
        dayTo: 8,
        order: 4
      }
    ]
  },
  {
    name: "Петрушка",
    type: "пряная зелень",
    difficulty: "MEDIUM",
    description: "Неприхотливая зелень, но всходит медленнее большинства культур.",
    lightRequirement: "несколько часов света в день",
    waterRequirement: "умеренный, без пересыхания",
    averageGerminationDays: 18,
    averageHarvestDays: 60,
    recommendedContainer: "горшок от 2 литров или длинный ящик",
    sowingDepth: "0.5-1 см",
    temperature: "18-22°C",
    stages: commonGreenStages
  },
  {
    name: "Руккола",
    type: "салатная зелень",
    difficulty: "EASY",
    description: "Быстрая салатная зелень с острым вкусом для подоконника и балкона.",
    lightRequirement: "много света или несколько часов прямого солнца",
    waterRequirement: "регулярный, небольшими порциями",
    averageGerminationDays: 4,
    averageHarvestDays: 28,
    recommendedContainer: "длинный ящик или контейнер",
    sowingDepth: "0.5 см",
    temperature: "16-22°C",
    stages: commonGreenStages
  },
  {
    name: "Перец острый",
    type: "овощи",
    difficulty: "MEDIUM",
    description: "Острый перец для солнечного окна. Растет дольше, зато хорошо живет в горшке.",
    lightRequirement: "очень много света",
    waterRequirement: "умеренный и регулярный",
    averageGerminationDays: 12,
    averageHarvestDays: 110,
    recommendedContainer: "горшок от 3-5 литров",
    sowingDepth: "0.5-1 см",
    temperature: "22-27°C",
    stages: [
      ...commonGreenStages,
      {
        title: "Бутоны и плоды",
        description: "Поддерживайте свет, тепло и ровный полив, когда появляются бутоны.",
        stageKey: "HARVEST",
        dayFrom: 70,
        dayTo: 120,
        order: 5
      }
    ]
  }
];

async function seedPlants() {
  for (const plant of plants) {
    await prisma.plantCatalog.upsert({
      where: { name: plant.name },
      update: {
        type: plant.type,
        difficulty: plant.difficulty,
        description: plant.description,
        lightRequirement: plant.lightRequirement,
        waterRequirement: plant.waterRequirement,
        averageGerminationDays: plant.averageGerminationDays,
        averageHarvestDays: plant.averageHarvestDays,
        recommendedContainer: plant.recommendedContainer,
        sowingDepth: plant.sowingDepth,
        temperature: plant.temperature,
        stages: {
          deleteMany: {},
          create: plant.stages
        }
      },
      create: {
        name: plant.name,
        type: plant.type,
        difficulty: plant.difficulty,
        description: plant.description,
        lightRequirement: plant.lightRequirement,
        waterRequirement: plant.waterRequirement,
        averageGerminationDays: plant.averageGerminationDays,
        averageHarvestDays: plant.averageHarvestDays,
        recommendedContainer: plant.recommendedContainer,
        sowingDepth: plant.sowingDepth,
        temperature: plant.temperature,
        stages: {
          create: plant.stages
        }
      }
    });
  }
}

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Администратор";

  if (!email || !password) {
    console.info("Admin seed skipped: set ADMIN_EMAIL and ADMIN_PASSWORD to create an admin user.");
    return;
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "ADMIN"
    },
    create: {
      email,
      name,
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  console.info(`Admin user is ready: ${email}`);
}

async function main() {
  await seedPlants();
  await seedAdminUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
