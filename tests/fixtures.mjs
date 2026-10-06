// Fictional content only. Tests never depend on private releases or audio files.
export const catalog = {
    defaultAlbum: 'demo-one',
    albums: Object.fromEntries(['demo-one', 'demo-two'].map((id, index) => [id, {
        id, artist: `Example Band ${index + 1}`, title: 'Example EP',
        year: 2020, type: 'EP', accent: '#4fbe85', cover: `assets/${id}/cover.jpg`,
        bio: { en: ['An example biography.'], it: ['Una biografia di esempio.'] },
        members: [{ name: 'Example Musician', roles: 'Vocals, Guitar' }],
        links: [{ label: 'Website', url: 'https://example.com/' }],
        tracks: Array.from({ length: 6 }, (_, i) => ({
            id: `t${String(i + 1).padStart(2, '0')}`, title: `Example Track ${i + 1}`,
            src: `assets/${id}/track-${i + 1}.mp3`, duration: 180 + i * 10,
        })),
    }])),
};
