import { system, Direction, GameMode, ItemStack } from '@minecraft/server';

class LayeredBlockManager {
    static COMPONENT_ID = "item:layered_block";
    static STATE_NAME = "layer:states";

    static init() {
        system.beforeEvents.startup.subscribe((initEvent) => this._onStartup(initEvent));
    }

    static _onStartup(initEvent) {
        initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
            onPlayerInteract: (data) => this._onPlayerInteract(data),
            onPlayerDestroy: (data) => this._onPlayerDestroy(data)
        });
    }

    static _onPlayerInteract(data) {
        const { block, dimension, player, face } = data;

        if (face !== Direction.Up) return;

        const currentLayer = block.permutation.getState(this.STATE_NAME);
        if (currentLayer === undefined || currentLayer >= 7) return;

        const equippable = player.getComponent("minecraft:equippable");
        const mainhandSlot = equippable?.getEquipmentSlot("Mainhand");
        if (!mainhandSlot) return;

        const item = mainhandSlot.getItem();
        if (!item || item.typeId !== block.typeId) return;

        if (player.getGameMode() !== GameMode.creative) {
            if (item.amount > 1) {
                item.amount -= 1;
                mainhandSlot.setItem(item);
            } else {
                mainhandSlot.setItem(undefined);
            }
        }

        dimension.playSound("use.stone", block.center(), { volume: 1.0, pitch: 1.0 });

        const nextPermutation = block.permutation.withState(this.STATE_NAME, currentLayer + 1);
        block.setPermutation(nextPermutation);
    }

    static _onPlayerDestroy(data) {
        const { block, dimension, player, destroyedBlockPermutation } = data;

        if (player && player.getGameMode() === GameMode.creative) return;

        const layerValue = destroyedBlockPermutation.getState(this.STATE_NAME);

        if (layerValue === undefined || layerValue === 0) return;

        try {
            const dropLocation = {
                x: block.location.x + 0.5,
                y: block.location.y + 0.5,
                z: block.location.z + 0.5
            };

            const blockRawId = destroyedBlockPermutation.type.id;
            const dropItem = new ItemStack(blockRawId, layerValue);

            dimension.spawnItem(dropItem, dropLocation);
        } catch (error) {
            console.warn(`[LayeredBlockManager] Error handling of dropped items for the block at: ${block.location.x}, ${block.location.y}, ${block.location.z}`);
        }
    }
}

LayeredBlockManager.init();