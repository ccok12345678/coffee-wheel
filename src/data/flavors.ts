/**
 * Coffee Taster's Flavor Wheel data.
 * Hierarchy, order (clockwise from 12 o'clock) and colours follow the reference
 * wheel image; colours were sampled from it.
 */

export type Lang = 'zh' | 'en';

export interface FlavorNode {
  id: string;
  name: Record<Lang, string>;
  color: string;
  children?: FlavorNode[];
}

function f(id: string, en: string, zh: string, color: string, children?: FlavorNode[]): FlavorNode {
  return { id, name: { en, zh }, color, children };
}

export const flavorTree: FlavorNode = f('root', 'All flavors', '全部風味', '#6b4226', [
  f('fruity', 'Fruity', '水果', '#ee000c', [
    f('berry', 'Berry', '莓果', '#f13d4c', [
      f('blackberry', 'Blackberry', '黑莓', '#460017'),
      f('raspberry', 'Raspberry', '覆盆子', '#fc0267'),
      f('blueberry', 'Blueberry', '藍莓', '#636ab6'),
      f('strawberry', 'Strawberry', '草莓', '#ff0027'),
    ]),
    f('dried-fruit', 'Dried fruit', '果乾', '#da3d3e', [
      f('raisin', 'Raisin', '葡萄乾', '#c32d54'),
      f('prune', 'Prune', '黑棗乾', '#b03c70'),
    ]),
    f('other-fruit', 'Other fruit', '其他水果', '#fe5c41', [
      f('coconut', 'Coconut', '椰子', '#dd771d'),
      f('cherry', 'Cherry', '櫻桃', '#fc074c'),
      f('pomegranate', 'Pomegranate', '紅石榴', '#f94751'),
      f('pineapple', 'Pineapple', '鳳梨', '#ff9403'),
      f('grape', 'Grape', '葡萄', '#abb901'),
      f('apple', 'Apple', '蘋果', '#02bb32'),
      f('peach', 'Peach', '水蜜桃', '#ff8250'),
      f('pear', 'Pear', '西洋梨', '#c0a602'),
    ]),
    f('citrus-fruit', 'Citrus fruit', '柑橘', '#ff9b00', [
      f('grapefruit', 'Grapefruit', '葡萄柚', '#fd574d'),
      f('orange', 'Orange', '柳橙', '#f35802'),
      f('lemon', 'Lemon', '檸檬', '#ffe403'),
      f('lime', 'Lime', '萊姆', '#6fb211'),
    ]),
  ]),
  f('sour-fermented', 'Sour/Fermented', '酸／發酵', '#f4b100', [
    f('sour', 'Sour', '酸', '#e7c200', [
      f('sour-aromatics', 'Sour aromatics', '酸香', '#9ba800'),
      f('acetic-acid', 'Acetic acid', '醋酸', '#8fa869'),
      f('butyric-acid', 'Butyric acid', '丁酸', '#d6b236'),
      f('isovaleric-acid', 'Isovaleric acid', '異戊酸', '#84b82e'),
      f('citric-acid', 'Citric acid', '檸檬酸', '#fcef02'),
      f('malic-acid', 'Malic acid', '蘋果酸', '#c6ba02'),
    ]),
    f('alcohol-fermented', 'Alcohol/Fermented', '酒香／發酵', '#b5980b', [
      f('winey', 'Winey', '葡萄酒', '#9c0153'),
      f('whiskey', 'Whiskey', '威士忌', '#c33433'),
      f('fermented', 'Fermented', '發酵', '#c1900b'),
      f('overripe', 'Overripe', '過熟', '#936231'),
    ]),
  ]),
  f('green-vegetative', 'Green/Vegetative', '綠色／植物', '#017c22', [
    f('olive-oil', 'Olive oil', '橄欖油', '#9fb301'),
    f('raw', 'Raw', '生豆味', '#6a8b21'),
    f('green-vegetative-sub', 'Green/Vegetative', '綠色／植物', '#01a54c', [
      f('under-ripe', 'Under-ripe', '未熟', '#9abd01'),
      f('peapod', 'Peapod', '豆莢', '#46ac20'),
      f('fresh', 'Fresh', '新鮮', '#03aa48'),
      f('dark-green', 'Dark green', '深綠', '#048744'),
      f('vegetative', 'Vegetative', '蔬菜', '#01b73a'),
      f('hay-like', 'Hay-like', '乾草', '#a2a903'),
      f('herb-like', 'Herb-like', '草本', '#61c41e'),
    ]),
    f('beany', 'Beany', '豆腥味', '#499d7e'),
  ]),
  f('other', 'Other', '其他', '#01a6b9', [
    f('papery-musty', 'Papery/Musty', '紙味／霉味', '#99b4b8', [
      f('stale', 'Stale', '陳腐', '#8b8c90'),
      f('cardboard', 'Cardboard', '紙板', '#c0b16c'),
      f('papery', 'Papery', '紙味', '#efe6c6'),
      f('woody', 'Woody', '木質', '#7b4d01'),
      f('moldy-damp', 'Moldy/Damp', '霉味／潮濕', '#a5a36b'),
      f('musty-dusty', 'Musty/Dusty', '霉味／灰塵', '#ceb47d'),
      f('musty-earthy', 'Musty/Earthy', '霉味／泥土', '#9a863d'),
      f('animalic', 'Animalic', '動物味', '#9e987d'),
      f('meaty-brothy', 'Meaty/Brothy', '肉味／肉湯', '#d97866'),
      f('phenolic', 'Phenolic', '酚類', '#ea5b67'),
    ]),
    f('chemical', 'Chemical', '化學', '#5bc2cd', [
      f('bitter', 'Bitter', '苦', '#76aa9e'),
      f('salty', 'Salty', '鹹', '#bfe3f2'),
      f('medicinal', 'Medicinal', '藥味', '#729cb0'),
      f('petroleum', 'Petroleum', '石油', '#03a4bb'),
      f('skunky', 'Skunky', '臭鼬味', '#57787b'),
      f('rubber', 'Rubber', '橡膠', '#140d0d'),
    ]),
  ]),
  f('roasted', 'Roasted', '烘焙', '#da3d20', [
    f('pipe-tobacco', 'Pipe tobacco', '菸斗菸草', '#d1a360'),
    f('tobacco', 'Tobacco', '菸草', '#e6bc75'),
    f('burnt', 'Burnt', '焦味', '#c7825c', [
      f('acrid', 'Acrid', '嗆辣', '#bea437'),
      f('ashy', 'Ashy', '灰燼', '#869893'),
      f('smoky', 'Smoky', '煙燻', '#ab7330'),
      f('brown-roast', 'Brown, Roast', '深焙', '#934302'),
    ]),
    f('cereal', 'Cereal', '穀物', '#e6ad52', [
      f('grain', 'Grain', '穀類', '#bd8f6a'),
      f('malt', 'Malt', '麥芽', '#f99853'),
    ]),
  ]),
  f('spices', 'Spices', '香料', '#be013b', [
    f('pungent', 'Pungent', '辛辣', '#814353'),
    f('pepper', 'Pepper', '胡椒', '#df273c'),
    f('brown-spice', 'Brown spice', '棕色香料', '#c04455', [
      f('anise', 'Anise', '茴香', '#d18717'),
      f('nutmeg', 'Nutmeg', '肉豆蔻', '#981d27'),
      f('cinnamon', 'Cinnamon', '肉桂', '#f66e01'),
      f('clove', 'Clove', '丁香', '#a76757'),
    ]),
  ]),
  f('nutty-cocoa', 'Nutty/Cocoa', '堅果／可可', '#b17962', [
    f('nutty', 'Nutty', '堅果', '#d28363', [
      f('peanuts', 'Peanuts', '花生', '#dcac04'),
      f('hazelnut', 'Hazelnut', '榛果', '#a7502a'),
      f('almond', 'Almond', '杏仁', '#cf9e80'),
    ]),
    f('cocoa', 'Cocoa', '可可', '#c67243', [
      f('chocolate', 'Chocolate', '巧克力', '#732615'),
      f('dark-chocolate', 'Dark chocolate', '黑巧克力', '#4f0101'),
    ]),
  ]),
  f('sweet', 'Sweet', '甜', '#f94a1c', [
    f('brown-sugar', 'Brown sugar', '黑糖', '#e64f54', [
      f('molasses', 'Molasses', '糖蜜', '#36090d'),
      f('maple-syrup', 'Maple syrup', '楓糖漿', '#bd240d'),
      f('caramelized', 'Caramelized', '焦糖', '#e58302'),
      f('honey', 'Honey', '蜂蜜', '#eb5203'),
    ]),
    f('vanilla', 'Vanilla', '香草', '#fe957b'),
    f('vanillin', 'Vanillin', '香草醛', '#fd6d70'),
    f('overall-sweet', 'Overall sweet', '整體甜感', '#fb4f64'),
    f('sweet-aromatics', 'Sweet aromatics', '甜香', '#e2495d'),
  ]),
  f('floral', 'Floral', '花香', '#ef0168', [
    f('black-tea', 'Black tea', '紅茶', '#a05b6e'),
    f('floral-sub', 'Floral', '花香', '#f26a9f', [
      f('chamomile', 'Chamomile', '洋甘菊', '#fe9a01'),
      f('rose', 'Rose', '玫瑰', '#ff4b76'),
      f('jasmine', 'Jasmine', '茉莉花', '#faf2b9'),
    ]),
  ]),
]);

/** A node of the tree with layout and lookup information attached. */
export interface LaidOutNode {
  node: FlavorNode;
  id: string;
  depth: number;
  parent: LaidOutNode | null;
  children: LaidOutNode[];
  /** Angular extent as a fraction of the full circle (0..1), sized by leaf count. */
  x0: number;
  x1: number;
  /** Depth-first order, used to sort selections into wheel order. */
  order: number;
  leafCount: number;
}

function countLeaves(node: FlavorNode): number {
  return node.children ? node.children.reduce((sum, child) => sum + countLeaves(child), 0) : 1;
}

function layout(): { root: LaidOutNode; byId: Map<string, LaidOutNode>; maxDepth: number } {
  const byId = new Map<string, LaidOutNode>();
  const total = countLeaves(flavorTree);
  let order = 0;
  let maxDepth = 0;

  function visit(node: FlavorNode, depth: number, parent: LaidOutNode | null, start: number): LaidOutNode {
    const leafCount = countLeaves(node);
    const laidOut: LaidOutNode = {
      node,
      id: node.id,
      depth,
      parent,
      children: [],
      x0: start / total,
      x1: (start + leafCount) / total,
      order: order++,
      leafCount,
    };
    byId.set(node.id, laidOut);
    maxDepth = Math.max(maxDepth, depth);
    let cursor = start;
    for (const child of node.children ?? []) {
      laidOut.children.push(visit(child, depth + 1, laidOut, cursor));
      cursor += countLeaves(child);
    }
    return laidOut;
  }

  const root = visit(flavorTree, 0, null, 0);
  return { root, byId, maxDepth };
}

export const { root: wheelRoot, byId: nodesById, maxDepth: wheelDepth } = layout();

/** Every node in depth-first order, excluding the root. */
export const allNodes: LaidOutNode[] = [...nodesById.values()].filter((n) => n.depth > 0);

export function ancestorsOf(node: LaidOutNode): LaidOutNode[] {
  const path: LaidOutNode[] = [];
  for (let current: LaidOutNode | null = node; current; current = current.parent) path.unshift(current);
  return path;
}

export function isAncestorOrSelf(ancestor: LaidOutNode, node: LaidOutNode): boolean {
  for (let current: LaidOutNode | null = node; current; current = current.parent) {
    if (current === ancestor) return true;
  }
  return false;
}
