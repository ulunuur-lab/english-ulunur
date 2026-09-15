import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create teacher
  const teacherHash = await bcrypt.hash("teacher123", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@ulunurs.english" },
    update: {},
    create: {
      name: "Teacher",
      email: "teacher@ulunurs.english",
      passwordHash: teacherHash,
      role: "teacher",
    },
  });
  console.log(`✅ Teacher created: ${teacher.email}`);

  // Create student
  const studentHash = await bcrypt.hash("student123", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@ulunurs.english" },
    update: {},
    create: {
      name: "Student",
      email: "student@ulunurs.english",
      passwordHash: studentHash,
      role: "student",
    },
  });
  console.log(`✅ Student created: ${student.email}`);

  // Initialize progress for student (all skills at 0)
  const skills = ["reading", "writing", "listening", "speaking", "grammar", "vocabulary"];
  for (const skill of skills) {
    await prisma.progress.upsert({
      where: { userId_skill: { userId: student.id, skill } },
      update: {},
      create: {
        userId: student.id,
        skill,
        score: 0,
      },
    });
  }
  console.log("✅ Progress initialized for student");

  // Initialize streak for student
  await prisma.streak.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      currentStreak: 0,
      longestStreak: 0,
    },
  });
  console.log("✅ Streak initialized for student");

  // Create a sample lesson
  await prisma.lesson.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Conditional Sentences (Second & Third)",
      skill: "grammar",
      orderIndex: 1,
      isPublished: true,
      content: `# Conditional Sentences: Second & Third

## Second Conditional (Unreal Present/Future)

**Structure:** If + past simple, would + infinitive

Used for **hypothetical or unlikely situations** in the present or future.

### Examples:
- If I **had** more time, I **would study** abroad.
- If she **spoke** French, she **would apply** for the job in Paris.
- If we **lived** near the sea, we **would go** swimming every day.

> ⚠️ Common mistake: Don't use "would" in the if-clause!
> ❌ If I would have more time...
> ✅ If I had more time...

### Special note on "were"
In formal English, we use **"were"** for all subjects:
- If I **were** you, I would accept the offer.
- If she **were** here, she would help us.

---

## Third Conditional (Unreal Past)

**Structure:** If + past perfect, would have + past participle

Used for **imagining different outcomes** of past events.

### Examples:
- If I **had studied** harder, I **would have passed** the exam.
- If they **had left** earlier, they **wouldn't have missed** the train.
- If you **had told** me, I **would have helped** you.

---

## Practice Tips
1. Identify whether you're talking about present/future (2nd) or past (3rd)
2. Pay attention to the verb forms in each clause
3. Try rewriting real situations as conditionals
`,
    },
  });
  console.log("✅ Sample lesson created");

  // Create a sample vocabulary list
  const vocabList = await prisma.vocabList.upsert({
    where: { id: 1 },
    update: {},
    create: {
      topic: "Abstract Concepts (B2)",
      description: "Common abstract nouns and adjectives needed for B2 level discussions",
    },
  });

  const vocabWords = [
    { word: "consequence", definition: "a result or effect of an action", exampleSentence: "The consequence of not studying is failing the exam." },
    { word: "significant", definition: "important enough to have an effect or be noticed", exampleSentence: "There has been a significant improvement in her writing." },
    { word: "contribute", definition: "to give something (time, money, ideas) to help achieve something", exampleSentence: "Everyone should contribute to the group project." },
    { word: "establish", definition: "to set up or create something on a permanent basis", exampleSentence: "The company was established in 1995." },
    { word: "appropriate", definition: "suitable or proper in the circumstances", exampleSentence: "Is this dress appropriate for a job interview?" },
    { word: "evidence", definition: "facts or signs that show something is true", exampleSentence: "There is strong evidence that exercise improves mental health." },
    { word: "challenge", definition: "a task or situation that tests someone's abilities", exampleSentence: "Learning a new language is always a challenge." },
    { word: "phenomenon", definition: "a fact or event that can be observed", exampleSentence: "Climate change is a global phenomenon." },
    { word: "perspective", definition: "a particular way of thinking about something", exampleSentence: "Try to see the situation from her perspective." },
    { word: "tendency", definition: "an inclination towards a particular way of behaving", exampleSentence: "He has a tendency to procrastinate." },
  ];

  for (const word of vocabWords) {
    await prisma.vocabCard.upsert({
      where: { id: vocabWords.indexOf(word) + 1 },
      update: {},
      create: {
        listId: vocabList.id,
        ...word,
      },
    });
  }
  console.log("✅ Sample vocabulary list created with 10 words");

  // Seed the 60-quest video game roadmap
  const { seedRoadmapTopics } = await import("./roadmap-data");
  await seedRoadmapTopics();

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Teacher: teacher@ulunurs.english / teacher123");
  console.log("   Student: student@ulunurs.english / student123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
