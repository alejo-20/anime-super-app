export type Character = {
  id: number;
  name: string;
  age: string;
  power: string;
  images: string[];
};

export type AnimeCategory = 'saintseiya' | 'hunterxhunter' | 'onepiece' | 'naruto';

export const CATEGORY_LABELS: Record<AnimeCategory, string> = {
  saintseiya: 'Saint Seiya',
  hunterxhunter: 'Hunter x Hunter',
  onepiece: 'One Piece',
  naruto: 'Naruto',
};

export const CATEGORY_COLORS: Record<AnimeCategory, string> = {
  saintseiya: '#4A90E2',
  hunterxhunter: '#E2A84A',
  onepiece: '#E24A4A',
  naruto: '#FF6B00',
};

// Imágenes usando picsum.photos con seeds fijos para consistencia
const img = (seed: number) => `https://picsum.photos/seed/${seed}/300/300`;

export const animeData: Record<AnimeCategory, Character[]> = {
  saintseiya: [
    { id: 1, name: 'Seiya', age: '13', power: 'Meteoro de Pegaso', images: [img(101), img(102), img(103), img(104)] },
    { id: 2, name: 'Shiryu', age: '13', power: 'Escudo de Rochi', images: [img(111), img(112), img(113), img(114)] },
    { id: 3, name: 'Hyoga', age: '13', power: 'Aurora Execution', images: [img(121), img(122), img(123), img(124)] },
    { id: 4, name: 'Shun', age: '13', power: 'Cadenas Nebulosas', images: [img(131), img(132), img(133), img(134)] },
    { id: 5, name: 'Ikki', age: '14', power: 'Fantasma de Fénix', images: [img(141), img(142), img(143), img(144)] },
    { id: 6, name: 'Aioria', age: '20', power: 'Plasma de Fotones', images: [img(151), img(152), img(153), img(154)] },
    { id: 7, name: 'Milo', age: '20', power: 'Escarlata Aguja', images: [img(161), img(162), img(163), img(164)] },
    { id: 8, name: 'Aldebaran', age: '20', power: 'Gran Cuerno', images: [img(171), img(172), img(173), img(174)] },
    { id: 9, name: 'Saga', age: '28', power: 'Galaxia Explosión', images: [img(181), img(182), img(183), img(184)] },
    { id: 10, name: 'Shaka', age: '20', power: 'Om', images: [img(191), img(192), img(193), img(194)] },
  ],
  hunterxhunter: [
    { id: 1, name: 'Gon', age: '12', power: 'Jajanken', images: [img(201), img(202), img(203), img(204)] },
    { id: 2, name: 'Killua', age: '12', power: 'Narukami', images: [img(211), img(212), img(213), img(214)] },
    { id: 3, name: 'Kurapika', age: '17', power: 'Cadena Imperativa', images: [img(221), img(222), img(223), img(224)] },
    { id: 4, name: 'Leorio', age: '19', power: 'Proyección 3D', images: [img(231), img(232), img(233), img(234)] },
    { id: 5, name: 'Hisoka', age: '28', power: 'Bungee Gum', images: [img(241), img(242), img(243), img(244)] },
    { id: 6, name: 'Chrollo', age: '26', power: 'Robo de Habilidades', images: [img(251), img(252), img(253), img(254)] },
    { id: 7, name: 'Illumi', age: '24', power: 'Control de Agujas', images: [img(261), img(262), img(263), img(264)] },
    { id: 8, name: 'Meruem', age: '40 días', power: 'Photon', images: [img(271), img(272), img(273), img(274)] },
    { id: 9, name: 'Netero', age: '120', power: '100 Tipo Guanyin', images: [img(281), img(282), img(283), img(284)] },
    { id: 10, name: 'Zeno', age: '67', power: 'Lluvia de Dragones', images: [img(291), img(292), img(293), img(294)] },
  ],
  onepiece: [
    { id: 1, name: 'Luffy', age: '19', power: 'Gomu Gomu no Mi', images: [img(301), img(302), img(303), img(304)] },
    { id: 2, name: 'Zoro', age: '21', power: 'Santoryu', images: [img(311), img(312), img(313), img(314)] },
    { id: 3, name: 'Nami', age: '20', power: 'Clima Tact', images: [img(321), img(322), img(323), img(324)] },
    { id: 4, name: 'Usopp', age: '19', power: 'Kabuto', images: [img(331), img(332), img(333), img(334)] },
    { id: 5, name: 'Sanji', age: '21', power: 'Diable Jambe', images: [img(341), img(342), img(343), img(344)] },
    { id: 6, name: 'Chopper', age: '17', power: 'Hito Hito no Mi', images: [img(351), img(352), img(353), img(354)] },
    { id: 7, name: 'Robin', age: '30', power: 'Hana Hana no Mi', images: [img(361), img(362), img(363), img(364)] },
    { id: 8, name: 'Franky', age: '36', power: 'Cuerpo Cyborg', images: [img(371), img(372), img(373), img(374)] },
    { id: 9, name: 'Brook', age: '90', power: 'Yomi Yomi no Mi', images: [img(381), img(382), img(383), img(384)] },
    { id: 10, name: 'Shanks', age: '39', power: 'Haki del Rey', images: [img(391), img(392), img(393), img(394)] },
  ],
  naruto: [
    { id: 1, name: 'Naruto', age: '17', power: 'Rasengan / Modo Sabio', images: [img(401), img(402), img(403), img(404)] },
    { id: 2, name: 'Sasuke', age: '17', power: 'Chidori / Mangekyou', images: [img(411), img(412), img(413), img(414)] },
    { id: 3, name: 'Sakura', age: '17', power: 'Fuerza Sobrehumana', images: [img(421), img(422), img(423), img(424)] },
    { id: 4, name: 'Kakashi', age: '29', power: 'Sharingan Copiador', images: [img(431), img(432), img(433), img(434)] },
    { id: 5, name: 'Rock Lee', age: '17', power: 'Apertura de Compuertas', images: [img(441), img(442), img(443), img(444)] },
    { id: 6, name: 'Gaara', age: '17', power: 'Arena Shinobi', images: [img(451), img(452), img(453), img(454)] },
    { id: 7, name: 'Jiraiya', age: '54', power: 'Modo Sabio de la Rana', images: [img(461), img(462), img(463), img(464)] },
    { id: 8, name: 'Tsunade', age: '51', power: 'Fuerza de Cien Sellos', images: [img(471), img(472), img(473), img(474)] },
    { id: 9, name: 'Itachi', age: '21', power: 'Amaterasu / Tsukuyomi', images: [img(481), img(482), img(483), img(484)] },
    { id: 10, name: 'Minato', age: '24', power: 'Rasengan / Paso Volador', images: [img(491), img(492), img(493), img(494)] },
  ],
};

export function searchCharacter(category: AnimeCategory, name: string): Character | null {
  const list = animeData[category];
  return list.find(c => c.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export function getAllCharacterNames(category: AnimeCategory): string[] {
  return animeData[category].map(c => c.name);
}
