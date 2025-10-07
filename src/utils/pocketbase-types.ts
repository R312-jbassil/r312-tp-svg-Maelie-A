Maëlie
mamaeleea_d
En ligne

Maëlie — 03/10/2025 15:10
On en a fait passé 8
🤡
mashisuu — 03/10/2025 15:14
ahi
Maëlie — 03/10/2025 15:39
Jai envie de pleurer
Vrm je me retiens la
On fait une pause
mashisuu — 03/10/2025 15:44
nan mon amour
ca va aller
ca se trouve la note va etre bien
Maëlie — 03/10/2025 15:45
La j’ai des doutes
mashisuu — 03/10/2025 16:07
bah jsp
mashisuu — 03/10/2025 16:32
ca va ?
Maëlie — 03/10/2025 16:32
Mouais
Il reste 5 pers
mashisuu — 03/10/2025 16:37
on se voit bientôt tqt
oki trop bien
mashisuu — 03/10/2025 16:49
désolé
j'ai pas fait de liste pour ce soir
quoi ramener
Maëlie — 03/10/2025 16:49
???
Bah tkt
Ta trousse de toilette
mashisuu — 03/10/2025 16:50
j'èsperre tu rentre plus tot
Maëlie — 03/10/2025 16:50
Les serviette
mashisuu — 03/10/2025 16:50
j'ai rien de mit dedans
Maëlie — 03/10/2025 16:50
Eh je pense pas
Tkt
mashisuu — 03/10/2025 16:50
j'ai juste besoins de mon parfum
Maëlie — 03/10/2025 16:50
Ok ok
Maëlie — 03/10/2025 17:23
On a toujours pas fini 🥲
Je suis dans le caca
J’espère que les bus vont passer quand de sort
Maëlie — 03/10/2025 17:32
Aled
Le pascal parle
Aled
Je vais jamais sortir
mashisuu — 03/10/2025 17:33
dit que tu dois sortir
ya pas quelqun en voiture
pour ramener
Maëlie — 03/10/2025 17:35
Bobel me ramène
mashisuu — 03/10/2025 17:36
super
mashisuu — Hier à 08:21
https://docs.google.com/document/d/14GEYozfDFO2ls64uWZhzfhjVVlFvYDBfZLeH75YKEAI/edit?usp=sharing
Google Docs
Anglais vidéo
mashisuu — Hier à 09:40
// src/i18n/ui.js
export const ui = {
  en: {
    nav: { home: 'Home', generator: 'Generator', gallery: 'Gallery', language: 'Language' },
    index: {
      title: 'Welcome to SVG Generator',
      description: 'Create and render SVGs from prompts.',
      button: 'Go to SVG Generator',

    },
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
    },
    generator: {
      title: 'SVG Generator',
      promptLabel: 'Enter your prompt:',
      generateButton: 'Generate SVG',
      editButton: 'Edit',
      copyButton: 'Copy SVG',
      saveButton: 'Save',
      contentPlaceholder: 'The SVG preview will appear here',
      codePlaceholder: 'The SVG code will appear here',
      preview: 'Preview',
    },
    gallery: {
      title: 'SVG Gallery',
      viewDetails: 'View',
      empty: 'No SVGs saved yet.',
    },
  },

  fr: {
    nav: { home: 'Accueil', generator: 'Générateur', gallery: 'Galerie', language: 'Langue' },
    index: {
      title: 'Bienvenue sur le générateur SVG',
      description: 'Créez et affichez des SVG à partir d’invites.',
      button: 'Aller au générateur SVG',

    },
    theme: {
      title: 'Thème',
      light: 'Clair',
      dark: 'Sombre',

    },
    generator: {
      title: 'Générateur SVG',
      promptLabel: 'Entrez votre prompt :',
      generateButton: 'Générer le SVG',
      editButton: 'Éditer',
      copyButton: 'Copier le SVG',
      saveButton: 'Sauvegarder',
      contentPlaceholder: 'L’aperçu SVG s’affichera ici',
      codePlaceholder: 'Le code SVG s’affichera ici',
      preview: 'Aperçu',
    },
    gallery: {
      title: 'Galerie SVG',
      viewDetails: 'Ouvrir',
      empty: 'Aucun SVG sauvegardé.',
    },
  },
};
export const onRequest = async (context, next) => {
  if (context.url.pathname.startsWith('/api/')) return next();

  if (context.request.method === 'POST') {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get('language');
    if (lang === 'en'  lang === 'fr') {
      context.cookies.set('locale', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return Response.redirect(new URL(context.url.pathname + context.url.search, context.url), 303);
    }
  }

  const cookieLocale = context.cookies.get('locale')?.value;
  context.locals.lang = (cookieLocale === 'fr'  cookieLocale === 'en')
    ? cookieLocale
    : (context.preferredLocale?.startsWith('fr') ? 'fr'
       : context.preferredLocale?.startsWith('en') ? 'en'
       : 'en');

  return next();
};
// src/pages/api/saveSVG.js
import pb from '../../utils/pb';
import { Collections } from '../../utils/pocketbase-types';

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Normalisation des champs (adapte "title" si ton champ s'appelle autrement)
    const payload = {
      title: data.title ?? data.nom ?? 'Sans titre',
      code_svg: data.code_svg ?? '',
      // chat_history peut arriver en string => on parse
      chat_history:
        typeof data.chat_history === 'string'
          ? JSON.parse(data.chat_history  '[]')
          : (data.chat_history ?? []),
    };

    const rec = await pb.collection(Collections.Svg).create(payload);

    return new Response(JSON.stringify({ success: true, id: rec.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error saving SVG:', err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message  'save error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
// src/pages/api/updateSVG.js
import pb from '../../utils/pb';
import { Collections } from '../../utils/pocketbase-types';

export async function POST({ request }) {
  try {
    const updated = await request.json(); // {id, code_svg, chat_history}
    const { id, ...rest } = updated;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'id manquant' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const payload = {
      ...rest,
      chat_history: typeof rest.chat_history === 'string'
        ? JSON.parse(rest.chat_history  '[]')
        : (rest.chat_history ?? []),
    };

    await pb.collection(Collections.Svg).update(id, payload);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('updateSVG error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message  'PB error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
---
export const prerender = false;

import Layout from "../../layouts/Layout.astro";
import pb from "../../utils/pb";
import { Collections, type SvgRecord } from "../../utils/pocketbase-types";
Afficher plus
message.txt
6 Ko
---
import Layout from '../../layouts/Layout.astro';
import pb from '../../utils/pb';
import { Collections, type SvgRecord } from '../../utils/pocketbase-types';
import { ui } from "../../i18n/ui.js";

const locale = Astro.locals.lang ?? 'en';

const list: SvgRecord[] = await pb
  .collection(Collections.Svg)
  .getFullList({ sort: '-created' });
---

<Layout title={ui[locale].gallery.title}>
  <h1 class="text-2xl font-bold mb-6">{ui[locale].gallery.title}</h1>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {list.map((item) => (
      <div class="card bg-base-100 shadow-xl border border-base-300">
        <div class="card-body gap-4">
          <h2 class="card-title">{item.title ?? '(sans titre)'}</h2>

          <div class="rounded-box bg-base-200 p-4 min-h-40">
            <div set:html={item.code_svg}></div>
          </div>

          <div class="card-actions justify-end">
            <a class="btn btn-primary btn-sm" href={/gallery/${item.id}}>Ouvrir</a>
          </div>
        </div>
      </div>
    ))}
  </div>
</Layout>
mashisuu — Hier à 09:47
<form method="POST" action={Astro.url.pathname} class="inline-block">
          <select name="language" class="select select-sm" onchange="this.form.submit()">
            <option disabled selected>{ui[locale].nav.language}</option>
            <option value="en" selected={locale === 'en'}>English</option>
            <option value="fr" selected={locale === 'fr'}>Français</option>
          </select>
        </form>
Maëlie — Hier à 16:11
https://drive.google.com/drive/folders/1bD_XNxeW0UKTK-kuhPuiN9h_-otQ0hPy?usp=sharing
Google Drive
mashisuu — 14:25
ok super : maintenant comment faire pour que chauque svg soit relier a un compte ? je dois faire des relations dans pocketbase puis apres ?
Maëlie — 14:25
oui des relations
mashisuu — 14:25
relation comment ?
le zizi ?
comme toi et moi ?
// src/pages/api/generateSVG.js
import { OpenAI } from 'openai';

const OR_TOKEN = import.meta.env.OR_TOKEN;
const OR_URL   = import.meta.env.OR_URL   'https://openrouter.ai/api/v1';
const OR_MODEL = import.meta.env.OR_MODEL  'openai/gpt-oss-20b:free';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET = () => json({ ok: true, hint: 'POST only' });

export const POST = async ({ request }) => {
  try {
    if (!OR_TOKEN) return json({ error: 'OR_TOKEN manquant' }, 500);

    const body = await request.json();
    // Compat : accepte soit un tableau de messages [{role,content}], soit {prompt:"..."}
    const messages = Array.isArray(body)
      ? body
      : (Array.isArray(body?.messages) ? body.messages
         : (body?.prompt ? [{ role: 'user', content: body.prompt }] : []));

    const systemMessage = {
      role: 'system',
      content:
        'You are an SVG code generator. Generate only raw SVG code for the following messages. ' +
        'Make sure to include ids for each important part of the SVG.',
    };

    const client = new OpenAI({
      baseURL: OR_URL,
      apiKey : OR_TOKEN,
    });

    const resp = await client.chat.completions.create({
      model: OR_MODEL,
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = resp.choices?.[0]?.message?.content ?? '';
    const match   = content.match(/<svg[\s\S]*?</svg>/i);
    const svg     = match ? match[0] : '';

    // On renvoie un "message" assistant pour coller au TP
    return json({ svg: { role: 'assistant', content: svg } });
  } catch (e) {
    console.error('generateSVG error:', e);
    return json({ error: 'Erreur serveur generateSVG' }, 500);
  }
};
Model Not Found | OpenRouter
The model you are looking for could not be found.
Model Not Found | OpenRouter
mashisuu — 14:49
// src/pages/api/saveSVG.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export async function POST({ request, locals }) {
  try {
    // 1) Sécurité : il faut être connecté
    const userId = locals?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Lecture + normalisation des données
    const data = await request.json().catch(() => ({}));

    const payload = {
      // accepte encore "nom" par rétro-compatibilité
      title: (data.title ?? data.nom ?? "N/A").toString(),
      code_svg: (data.code_svg ?? "<svg></svg>").toString(),
      chat_history: Array.isArray(data.chat_history)
        ? data.chat_history
        : (typeof data.chat_history === "string"
            ? JSON.parse(data.chat_history  "[]")
            : []),
      // on force le lien côté serveur (ne JAMAIS faire confiance au client)
      user: userId,
    };

    // 3) Création en base
    const record = await pb.collection(Collections.Svg).create(payload);

    return new Response(JSON.stringify({ success: true, id: record.id, record }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving SVG:", err);
    return new Response(JSON.stringify({ success: false, error: err?.message  "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
import PocketBase from 'pocketbase';
const PB_URL = import.meta.env.PB_URL ?? 'http://127.0.0.1:8090/';
const pb = new PocketBase(PB_URL);
export default pb;
/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Svg = "Svg",
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type SvgRecord<Tchat_history = unknown> = {
	chat_history?: null | Tchat_history
	code_svg?: string
	created?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
}

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
... (59lignes restantes)
Réduire
message.txt
5 Ko
﻿
mashisuu
mashisu_
 
insta: mathis_jllrd
tiktok: m.yato
twitch: mashi_su
/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Svg = "Svg",
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type SvgRecord<Tchat_history = unknown> = {
	chat_history?: null | Tchat_history
	code_svg?: string
	created?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
}

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type SvgResponse<Tchat_history = unknown, Texpand = unknown> = Required<SvgRecord<Tchat_history>> & BaseSystemFields<Texpand>
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	Svg: SvgRecord
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	Svg: SvgResponse
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'Svg'): RecordService<SvgResponse>
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}