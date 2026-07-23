import { world, system } from "@minecraft/server";

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const { block, itemStack, player } = event;

    if (!itemStack || (itemStack.typeId !== "minecraft:flint_and_steel" && itemStack.typeId !== "minecraft:fire_charge")) return;
    if (!block.hasTag("tnt")) return;

    const ignitedId = block.typeId;
    if (!ignitedId) return;

    event.cancel = true;

    const dimension = player.dimension;
    const loc = block.location;
    const spawnPos = { x: loc.x + 0.5, y: loc.y, z: loc.z + 0.5 };

    system.run(() => {
        try {
            dimension.getBlock(loc)?.setType("minecraft:air");
            const tntEntity = dimension.spawnEntity(`${ignitedId}_ignited`, spawnPos);

            tntEntity.applyImpulse({
                x: (Math.random() - 0.5) * 0.2,
                y: 0.25,
                z: (Math.random() - 0.5) * 0.2
            });

            dimension.playSound("random.fuse", spawnPos);
        } catch (e) {
            console.warn(`[Script Error]: Could not spawn ${ignitedId}. Does the entity exist?`);
        }
    });
});

world.beforeEvents.explosion.subscribe((event) => {
    const { dimension, source } = event;

    const impactedBlocks = event.getImpactedBlocks();
    impactedBlocks.forEach(block => {
        if (block.hasTag("tnt")) {
            const ignitedId = block.typeId;
            if (!ignitedId) return;

            const loc = block.location;
            const spawnPos = { x: loc.x + 0.5, y: loc.y, z: loc.z + 0.5 };

            system.run(() => {
                try {
                    dimension.getBlock(loc)?.setType("minecraft:air");
                    const tntEntity = dimension.spawnEntity(`${ignitedId}_ignited`, spawnPos);

                    tntEntity.applyImpulse({
                        x: (Math.random() - 0.5) * 0.2,
                        y: 0.25,
                        z: (Math.random() - 0.5) * 0.2
                    });

                    tntEntity.triggerEvent("from_explosion");

                    dimension.playSound("random.fuse", spawnPos);
                } catch (e) {
                    console.warn(`[Script Error]: Could not spawn ${ignitedId}. Does the entity exist?`);
                }
            });
        }
    });
});

world.beforeEvents.entityHurt.subscribe((event) => {
    const { hurtEntity } = event;

    if (hurtEntity.typeId.endsWith("_ignited")) {
        event.cancel = true;
    }
});

system.beforeEvents.startup.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent("tnt:trigger", {
        onRedstoneUpdate: (event) => {
            const { block, dimension } = event;

            const power = block.getRedstonePower();
            if (power === 0) return;

            const loc = block.location;
            const spawnPos = { x: loc.x + 0.5, y: loc.y, z: loc.z + 0.5 };
            const ignitedId = block.typeId;

            system.run(() => {
                try {
                    const blockToUpdate = dimension.getBlock(loc);

                    if (blockToUpdate && blockToUpdate.typeId === ignitedId) {
                        blockToUpdate?.setType("minecraft:air");

                        const tntEntity = dimension.spawnEntity(`${ignitedId}_ignited`, spawnPos);
                        tntEntity.applyImpulse({
                            x: 0,
                            y: 0.25,
                            z: 0
                        });

                        dimension.playSound("random.fuse", spawnPos);
                    }
                } catch (e) {
                    console.warn(`[Script Error]: Could not spawn ${ignitedId}_ignited with Redstone.`);
                }
            });
        }
    });
});