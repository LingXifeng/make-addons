import { world, Direction, system, BlockPermutation } from "@minecraft/server";

const SLAB_TAG = "custom_slab";
const DOUBLE = "pa:is_double";
const HALF = "minecraft:vertical_half";

const FACE_OFFSETS = {
    [Direction.Up]: { x: 0, y: 1, z: 0 },
    [Direction.Down]: { x: 0, y: -1, z: 0 },
    [Direction.North]: { x: 0, y: 0, z: -1 },
    [Direction.South]: { x: 0, y: 0, z: 1 },
    [Direction.East]: { x: 1, y: 0, z: 0 },
    [Direction.West]: { x: -1, y: 0, z: 0 },
};

function isSlabItem(itemStack) {
    if (!itemStack) return false;
    try {
        return BlockPermutation.resolve(itemStack.typeId).hasTag(SLAB_TAG);
    } catch {
        return false;
    }
}

function isSingleSlab(block) {
    return (
        block !== undefined &&
        block.hasTag(SLAB_TAG) &&
        !block.permutation.getState(DOUBLE)
    );
}

function placingHalf(face, faceLocation) {
    if (face === Direction.Up) return "bottom";
    if (face === Direction.Down) return "top";
    return (faceLocation?.y ?? 0) >= 0.5 ? "top" : "bottom";
}

function doMerge(e, slabBlock, player) {
    e.cancel = true;
    system.run(() => {
        slabBlock.setPermutation(slabBlock.permutation.withState(DOUBLE, true));
        decrementItem(player);
    });
}

function decrementItem(player) {
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;
    const item = equip.getEquipment("Mainhand");
    if (!item) return;
    if (player.getGameMode() === "creative") return;
    if (item.amount > 1) {
        item.amount--;
        equip.setEquipment("Mainhand", item);
    } else {
        equip.setEquipment("Mainhand", undefined);
    }
}

world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
    if (!e.isFirstEvent) return;

    const { player, block, blockFace: face, faceLocation } = e;

    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;
    if (!isSlabItem(equip.getEquipment("Mainhand"))) return;

    const placing = placingHalf(face, faceLocation);

    if (isSingleSlab(block)) {
        const existingHalf = block.permutation.getState(HALF);
        if (
            (face === Direction.Up && existingHalf === "bottom") ||
            (face === Direction.Down && existingHalf === "top")
        ) {
            doMerge(e, block, player);
            return;
        }
    }

    const off = FACE_OFFSETS[face];
    if (!off) return;

    const adjBlock = block.dimension.getBlock({
        x: block.location.x + off.x,
        y: block.location.y + off.y,
        z: block.location.z + off.z,
    });
    if (!isSingleSlab(adjBlock)) return;

    if (adjBlock.permutation.getState(HALF) !== placing) {
        doMerge(e, adjBlock, player);
    }
});
