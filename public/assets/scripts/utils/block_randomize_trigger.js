export function getWeightedRandom(array) {
    if (!array || array.length === 0) return null;

    const totalWeight = array.reduce((sum, item) => sum + (Number(item.weight) || 1), 0);

    const randomVal = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const item of array) {
        currentWeight += Number(item.weight) || 1;
        if (randomVal <= currentWeight) {
            return item;
        }
    }
    return null;
}

export function resolveTarget(targetName, e) {
    switch (targetName) {
        case "player": return e.player;
        case "entity": return e.entity;
        case "dimension": return e.dimension || e.block?.dimension;
        case "block.dimension": return e.block?.dimension;
        case "blockDestructionSource": return e.blockDestructionSource;
        case "attackingEntity": return e.attackingEntity;
        case "hitEntity": return e.hitEntity;
        case "entitySource": return e.entitySource;
        case "entity.dimension": return e.entity?.dimension;
        default: return e[targetName];
    }
}

export function executeAction(element, e) {
    if (element.add_mob_effect) {
        const data = element.add_mob_effect;
        const targetObj = resolveTarget(data.target, e);

        if (targetObj) {
            const duration = (data.duration || 1) * 20;
            const amplifier = Number(data.amplifier) || 1;
            try { targetObj.addEffect("minecraft:" + data.effect, duration, { amplifier }); } catch (err) { }
        }
    }

    if (element.remove_mob_effect) {
        const data = element.remove_mob_effect;
        const targetObj = resolveTarget(data.target, e);

        if (targetObj) {
            try { targetObj.removeEffect("minecraft:" + data.effect); } catch (err) { }
        }
    }

    if (element.run_command) {
        const data = element.run_command;
        if (!data.command) return;
        const targetObj = resolveTarget(data.target, e);

        if (targetObj) {
            for (const command of data.command) {
                try {
                    if (data.target.includes("dimension") && e.block) {
                        const { x, y, z } = e.block.location;
                        targetObj.runCommand(`execute positioned ${x} ${y} ${z} run ${command}`);
                    } else {
                        targetObj.runCommand(command);
                    }
                } catch (err) { }
            }
        }
    }
}