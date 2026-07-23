import { system, GameMode } from '@minecraft/server';

class CropManager {
    static COMPONENT_ID = 'item:crop';
    static STATE_GROWTH = 'pa:growth';

    static init() {
        system.beforeEvents.startup.subscribe(initEvent => {
            initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
                onRandomTick: e => this._handleRandomTick(e),
                onPlayerInteract: e => this._handleInteract(e)
            });
        });
    }

    static _handleRandomTick(e) {
        const { block, dimension } = e;

        if (!block || !block.isValid) return;

        try {
            const compParams = block.getComponent(this.COMPONENT_ID)?.customComponentParameters.params;
            const maxGrowth = compParams?.max_growth ?? 1;

            const growth = block.permutation.getState(this.STATE_GROWTH);

            if (growth >= maxGrowth) return;

            let growthChance = 1 / 3; 
            const blockBelow = block.below();

            if (blockBelow && blockBelow.isValid && blockBelow.typeId === 'minecraft:farmland') {
                const moisture = blockBelow.permutation.getState('moisture') ?? 0;
                growthChance = moisture > 0 ? 1 / 2 : 1 / 6;
            }

            if (Math.random() > growthChance) return;

            block.setPermutation(block.permutation.withState(this.STATE_GROWTH, growth + 1));
            dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());
        } catch (error) { }
    }

    static _handleInteract(e) {
        const { block, player, dimension } = e;

        if (!block || !block.isValid || !player) return;

        try {
            const equippable = player.getComponent("minecraft:equippable");
            if (!equippable) return;

            const mainhand = equippable.getEquipmentSlot("Mainhand");
            const item = mainhand.getItem();

            if (!item || item.typeId !== "minecraft:bone_meal") return;

            const compParams = block.getComponent(this.COMPONENT_ID)?.customComponentParameters?.params;
            const maxGrowth = compParams?.max_growth ?? 1;
            const boneMealBoost = compParams?.bone_meal_boost;

            let growth = block.permutation.getState(this.STATE_GROWTH);

            if (growth >= maxGrowth) return;

            let growthBoost = 1; 

            if (boneMealBoost) {
                const min = boneMealBoost[0];
                const max = boneMealBoost[1];
                growthBoost = Math.floor(Math.random() * (max - min + 1)) + min;
            } else if (maxGrowth >= 7) {
                growthBoost = Math.floor(Math.random() * 4) + 2; 
            } else if (maxGrowth >= 4) {
                growthBoost = Math.floor(Math.random() * 2) + 1; 
            }

            const newGrowth = Math.min(growth + growthBoost, maxGrowth); 

            block.setPermutation(block.permutation.withState(this.STATE_GROWTH, newGrowth));

            if (player.getGameMode() !== GameMode.creative) {
                if (item.amount > 1) {
                    item.amount -= 1;
                    mainhand.setItem(item);
                } else {
                    mainhand.setItem(undefined);
                }
            }

            const effectLocation = block.center();
            dimension.playSound("item.bone_meal.use", effectLocation);
            dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);
        } catch (error) { }
    }
}

CropManager.init();