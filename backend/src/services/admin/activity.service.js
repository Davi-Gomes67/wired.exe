const prisma = require('../../config/prisma');

const logActivity = async ({ action, entityType, entityId = null, entityLabel = null, actor, metadata = null }) => {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId: entityId == null ? null : Number(entityId),
        entityLabel: entityLabel == null ? null : String(entityLabel).slice(0, 200),
        actorId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        metadata: metadata ? JSON.stringify(metadata).slice(0, 2000) : null,
      },
    });
  } catch (e) {
    console.error('[WIRED.exe] activity log failed', e.message);
  }
};

const listActivities = async (limit = 20) => {
  const take = Math.min(100, Math.max(1, Number(limit) || 20));
  const items = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take });
  return items.map((i) => ({ ...i, metadata: i.metadata ? safeParse(i.metadata) : null }));
};

const safeParse = (v) => { try { return JSON.parse(v); } catch { return v; } };

module.exports = { logActivity, listActivities };
