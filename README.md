# T30.1 — Site da Turma

Site desenvolvido pelos alunos da sub-turma 1 da T30 do Instituto Tecnológico de Aeronáutica (ITA).

## Páginas

| Página | Arquivo | Descrição |
|---|---|---|
| Sobre a Turma | `index.html` | Hero, história da turma e lista dos 45 alunos |
| Calendário & Professores | `calendario.html` | Grade mensal navegável e cards dos professores |
| Mapa Falta | `mapa-falta.html` | Em construção |

## Estrutura

```
SiteT30.1/
├── index.html
├── calendario.html
├── mapa-falta.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    └── images/
```

## Tecnologias

- HTML5
- CSS3 (responsivo, sem frameworks)
- JavaScript puro

## Como rodar

Abra qualquer arquivo `.html` diretamente no navegador. Não requer servidor.

## Personalização

- **Imagem de fundo do hero:** descomente a linha `background-image` em `.hero-bg` no `style.css` e coloque a imagem em `assets/images/`.
- **Foto da turma:** substitua o placeholder na seção "Nossa História" em `index.html` por uma tag `<img>`.
- **Eventos no calendário:** adicione entradas no objeto `EVENTS` em `js/main.js` no formato `'YYYY-M-D': 'Descrição do evento'`.
- **Dados reais:** substitua os placeholders de alunos e professores nos respectivos arquivos HTML.
