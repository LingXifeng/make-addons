import { world, system, EntityDamageCause } from "@minecraft/server";

const fallData = new Map();

world.afterEvents.playerLeave.subscribe((e) => {
  fallData.delete(e.playerId);
});

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
  if (damagingEntity.typeId !== "minecraft:player") return;

  const player = damagingEntity;
  const startY = fallData.get(player.id);

  if (startY === undefined) return;

  fallData.delete(player.id);

  const fallDistance = startY - player.location.y;
  if (fallDistance < 1.5) return;

  const dimension = player.dimension;
  const hitLoc = hitEntity.location;
  const isTargetNearGround = hitEntity.isOnGround || (hitLoc.y - Math.floor(hitLoc.y) < 2.0);

  const equipment = player.getComponent("minecraft:equippable");
  const item = equipment?.getEquipment("Mainhand");

  if (!item?.hasTag("pa:is_mace")) return;

  let extraDamage = _extraDamage(fallDistance);

  const densityEnchant = item.getComponent("minecraft:enchantable")?.getEnchantment("density");
  if (densityEnchant) {
    extraDamage += (0.5 * densityEnchant.level) * fallDistance;
  }

  hitEntity.applyDamage(extraDamage, { cause: EntityDamageCause.entityAttack, damagingEntity: player });

  if (!player.isOnGround && !hitEntity.isOnGround && !isTargetNearGround) {
    dimension.playSound("mace.smash_air", hitLoc);
    dimension.spawnParticle("minecraft:critical_hit_emitter", hitLoc);
  } else {
    dimension.playSound(fallDistance > 5.5 ? "mace.heavy_smash_ground" : "mace.smash_ground", hitLoc);
    dimension.spawnParticle("minecraft:critical_hit_emitter", hitLoc);

    try {
      dimension.spawnEntity("pa:custom_mace_slam", hitLoc);
    } catch (e) { }
  }
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const id = player.id;

    if (!player.isOnGround && player.getVelocity().y < -0.1) {

      if (fallData.has(id)) continue;

      const equipment = player.getComponent("minecraft:equippable");
      const item = equipment?.getEquipment("Mainhand");

      if (item?.hasTag("pa:is_mace")) {
        const isInvalid = player.isInWater ||
          player.isClimbing ||
          player.isGliding ||
          player.isFlying ||
          player.getEffect("minecraft:slow_falling") ||
          player.getEffect("minecraft:levitation");

        if (!isInvalid) {
          fallData.set(id, player.location.y);
        }
      }
    } else {
      if (fallData.has(id)) {
        fallData.delete(id);
      }
    }
  }
}, 1);

function _extraDamage(fallDistance) {
  let damage = 0;
  if (fallDistance <= 3.0) {
    damage = fallDistance * 4.0;
  } else if (fallDistance <= 8.0) {
    damage = 12.0 + ((fallDistance - 3.0) * 2.0);
  } else {
    damage = 22.0 + (fallDistance - 8.0);
  }
  return damage;
}