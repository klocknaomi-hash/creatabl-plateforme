const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Function to generate random integer between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to sub days from a date
function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

// Function to add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const mockPostsTemplates = [
  {
    content: "💡 L'intelligence artificielle n'est plus une simple option pour créer du contenu. Elle redéfinit l'efficacité de vos campagnes social media en un clin d'œil. Gagnez jusqu'à 10h par semaine ! 🚀\n\n#IA #ContentCreation #SocialMedia #MarketingDigital",
    platforms: ["linkedin", "twitter", "facebook"]
  },
  {
    content: "🚀 Comment doubler son taux d'engagement sur Instagram en 2026 ? Les secrets des meilleurs créateurs décryptés dans notre dernier article de blog. Spoiler : l'authenticité l'emporte toujours. 📈🔥\n\n#InstagramGrowth #SocialMediaStrategy #ContentStrategy #Engagement",
    platforms: ["instagram", "facebook", "linkedin"]
  },
  {
    content: "🔥 Notre nouvel agent IA est officiellement disponible sur Creatabl.ia ! Rédigez, planifiez et analysez vos posts en mode automatique. Le futur de la création est ici. 🤖✨\n\n#Creatabl #ArtificialIntelligence #SocialMediaManager",
    platforms: ["twitter", "linkedin"]
  },
  {
    content: "🎬 Short-form video is KING. Si vous ne publiez pas au moins 3 TikToks ou Reels par semaine, vous passez à côté d'une croissance organique massive. Voici notre guide étape par étape. 📽️👇\n\n#TikTokStrategy #Reels #Shorts #VideoMarketing",
    platforms: ["tiktok", "instagram", "youtube"]
  },
  {
    content: "🎯 Vos performances du mois d'avril sont arrivées ! Analyser régulièrement vos données chiffrées est l'unique moyen de savoir ce qui plaît vraiment à votre audience. Ne devinez plus, mesurez. 📊\n\n#DataAnalytics #MarketingTips #SocialMediaData",
    platforms: ["facebook", "linkedin", "twitter"]
  },
  {
    content: "🎨 5 erreurs de design qui tuent la portée de vos posts carrousels. Le carrousel reste le format le plus engageant sur LinkedIn et Instagram, à condition de soigner le visuel et l'accroche. 🧑‍🎨💎\n\n#LinkedInTips #DesignSystem #VisualMarketing",
    platforms: ["linkedin", "instagram"]
  },
  {
    content: "🌟 L'art du storytelling en entreprise. Raconter une histoire sincère crée un lien émotionnel unique avec vos clients. C'est ce qui fait la différence entre une marque et un simple produit. ❤️✍️\n\n#Storytelling #BrandStrategy #EntrepreneurLife",
    platforms: ["linkedin", "facebook", "instagram"]
  },
  {
    content: "⚡ Le saviez-vous ? Publier au bon moment peut augmenter votre portée organique de plus de 40%. Grâce à l'algorithme intelligent de Creatabl, planifiez vos posts aux heures d'audience maximale. ⏰✨\n\n#SocialMediaPlanning #GrowthHacking #MarketingAutomation",
    platforms: ["twitter", "facebook", "linkedin"]
  }
];

const mockScheduledTemplates = [
  {
    content: "📅 [Planifié] Rejoignez notre webinar jeudi prochain sur l'impact de l'IA générative dans le e-commerce. Places limitées, inscrivez-vous dès maintenant ! 🔗👇\n\n#Webinar #GenerativeAI #Ecommerce",
    platforms: ["linkedin", "twitter"]
  },
  {
    content: "📸 [Planifié] Dans les coulisses de la création de notre plateforme. Comment notre équipe de dev a surmonté les défis techniques pour vous proposer l'outil le plus rapide du marché. 💻🛠️\n\n#BehindTheScenes #TechStartup #NextJS",
    platforms: ["instagram", "facebook"]
  },
  {
    content: "🎙️ [Planifié] Nouvel épisode de podcast en ligne ! Cette semaine, nous recevons une créatrice qui gère 5 comptes de marques et génère plus de 2M de vues par mois. Des conseils en or. 🎧💡\n\n#Podcast #SocialMediaGrow #CreatorEconomy",
    platforms: ["linkedin", "youtube", "twitter"]
  }
];

const mockDraftTemplates = [
  {
    content: "📝 [Brouillon] Pourquoi nous avons arrêté de faire de la publicité payante pendant 3 mois. Les résultats vont vous surprendre... (à compléter avec les graphes)",
    platforms: ["linkedin"]
  },
  {
    content: "📝 [Brouillon] Liste d'outils indispensables pour tout social media manager en 2026. (Creatabl, Figma, ImageKit, Notion, Canva...)",
    platforms: ["twitter", "linkedin"]
  }
];

async function seed() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No database URL found in env");
    return;
  }

  const sql = neon(dbUrl);
  console.log("Connected to database successfully.");

  // Users we want to seed:
  // 1. Naomi (klock.naomi@gmail.com): de8fb069-50db-4c21-94c0-e3b19eb16481 (clerk user_3CqC4wiXjZAh1jXUm7C7A3O3k7k)
  // 2. Business Test User (business-test@creatabl-ia.com): 90b02bc7-f294-4f4a-97e4-7f742b88f4f2 (clerk user_3E2HBXcRSqTpz5RdBAAJ0vWdA99)
  const usersToSeed = [
    {
      id: 'de8fb069-50db-4c21-94c0-e3b19eb16481',
      clerkId: 'user_3CqC4wiXjZAh1jXUm7C7A3O3k7k',
      email: 'klock.naomi@gmail.com', // Updated dot email
      name: 'Naomi Klock',
      plan: 'business',
      usernameSuffix: 'naomi'
    },
    {
      id: '90b02bc7-f294-4f4a-97e4-7f742b88f4f2',
      clerkId: 'user_3E2HBXcRSqTpz5RdBAAJ0vWdA99',
      email: 'business-test@creatabl-ia.com',
      name: 'Creatabl Business',
      plan: 'business',
      usernameSuffix: 'agency'
    }
  ];

  for (const u of usersToSeed) {
    console.log(`\n========================================`);
    console.log(`SEEDING DATA FOR USER: ${u.email}`);
    console.log(`========================================`);

    // 2. Update DB User table to Business tier & onboarding complete
    await sql`
      UPDATE users 
      SET email = ${u.email},
          plan = ${u.plan},
          selected_plan = ${u.plan},
          onboarding_completed = true,
          onboarding_completed_at = NOW(),
          trial_started_at = NOW(),
          trial_ends_at = '2099-12-31 00:00:00'::timestamp
      WHERE id = ${u.id};
    `;
    console.log("Updated users table fields.");

    // Ensure user settings exists
    const existingSettings = await sql`SELECT 1 FROM user_settings WHERE user_id = ${u.id};`;
    if (existingSettings.length === 0) {
      await sql`
        INSERT INTO user_settings (user_id, timezone, language, locale)
        VALUES (${u.id}, 'Europe/Paris', 'fr', 'fr-FR');
      `;
      console.log("Inserted user_settings.");
    } else {
      await sql`
        UPDATE user_settings 
        SET language = 'fr', locale = 'fr-FR', timezone = 'Europe/Paris'
        WHERE user_id = ${u.id};
      `;
      console.log("Updated user_settings language to fr.");
    }

    // 3. Delete existing posts, platform results and social accounts to prevent duplicates/conflicts
    console.log("Cleaning up old data...");
    await sql`
      DELETE FROM post_platform_results 
      WHERE post_id IN (SELECT id FROM posts WHERE user_id = ${u.id});
    `;
    await sql`DELETE FROM posts WHERE user_id = ${u.id};`;
    await sql`DELETE FROM social_accounts WHERE user_id = ${u.id};`;

    // 4. Create connected social accounts (6 platforms)
    const platforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok', 'youtube'];
    const seededAccounts = [];

    console.log("Inserting social accounts...");
    for (const p of platforms) {
      const username = p === 'linkedin' 
        ? (u.usernameSuffix === 'naomi' ? 'Naomi Klock' : 'Creatabl Agency')
        : `${u.usernameSuffix}_${p}`;
      
      const avatarUrl = p === 'instagram' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
                      : p === 'linkedin' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
                      : p === 'twitter' ? 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=150'
                      : p === 'facebook' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
                      : p === 'tiktok' ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
                      : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150';

      const accId = crypto.randomUUID();
      await sql`
        INSERT INTO social_accounts (id, user_id, platform, platform_user_id, username, avatar_url, expires_at)
        VALUES (${accId}, ${u.id}, ${p}, ${'platform_uid_' + p}, ${username}, ${avatarUrl}, '2099-12-31 00:00:00'::timestamp);
      `;
      seededAccounts.push({ platform: p, id: accId, username });
    }
    console.log(`Seeded ${seededAccounts.length} social accounts.`);

    // 5. Seed Published Posts & Results over last 30 days
    console.log("Inserting published posts & platform results...");
    const now = new Date();
    
    // We will generate posts spanning 25 days
    for (let dayOffset = 1; dayOffset <= 25; dayOffset++) {
      const template = mockPostsTemplates[dayOffset % mockPostsTemplates.length];
      const publishedAt = subDays(now, dayOffset);
      const postPlatforms = template.platforms;

      // Insert post
      const postId = crypto.randomUUID();
      await sql`
        INSERT INTO posts (id, user_id, content, status, published_at, created_at)
        VALUES (${postId}, ${u.id}, ${template.content}, 'published', ${publishedAt}, ${subDays(publishedAt, 1)});
      `;

      // Insert platform results
      for (const p of postPlatforms) {
        // Higher stats for linkedin / instagram / tiktok
        let multiplier = 1;
        if (p === 'tiktok') multiplier = 3.5;
        if (p === 'instagram') multiplier = 2.0;
        if (p === 'linkedin') multiplier = 1.5;

        const impressions = Math.round(randomInt(500, 3000) * multiplier);
        const reach = Math.round(impressions * randomInt(70, 95) / 100);
        const likes = Math.round(impressions * randomInt(3, 10) / 100);
        const comments = Math.round(likes * randomInt(5, 20) / 100);
        const shares = Math.round(likes * randomInt(2, 10) / 100);

        await sql`
          INSERT INTO post_platform_results (post_id, platform, status, published_at, likes, comments, shares, reach, impressions)
          VALUES (${postId}, ${p}, 'success', ${publishedAt}, ${likes}, ${comments}, ${shares}, ${reach}, ${impressions});
        `;
      }
    }
    console.log("Seeded 25 published posts with results.");

    // 6. Seed Scheduled Posts
    console.log("Inserting scheduled posts...");
    for (let i = 0; i < mockScheduledTemplates.length; i++) {
      const template = mockScheduledTemplates[i];
      const scheduledAt = addDays(now, (i + 1) * 3);
      const postId = crypto.randomUUID();

      await sql`
        INSERT INTO posts (id, user_id, content, status, scheduled_at, created_at)
        VALUES (${postId}, ${u.id}, ${template.content}, 'scheduled', ${scheduledAt}, ${now});
      `;
    }
    console.log(`Seeded ${mockScheduledTemplates.length} scheduled posts.`);

    // 7. Seed Drafts
    console.log("Inserting draft posts...");
    for (let i = 0; i < mockDraftTemplates.length; i++) {
      const template = mockDraftTemplates[i];
      const postId = crypto.randomUUID();

      await sql`
        INSERT INTO posts (id, user_id, content, status, created_at)
        VALUES (${postId}, ${u.id}, ${template.content}, 'draft', ${now});
      `;
    }
    console.log(`Seeded ${mockDraftTemplates.length} drafts.`);
  }

  console.log("\nSeeding finished successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
