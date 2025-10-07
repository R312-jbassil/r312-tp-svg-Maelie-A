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
// 1757184118
// GENERATED CODE - DO NOT MODIFY BY HAND

// -------------------------------------------------------------------
// cronBinds
// -------------------------------------------------------------------

/**
 * CronAdd registers a new cron job.
 *
 * If a cron job with the specified name already exist, it will be
 * replaced with the new one.
 *
 * Example:
 *
 * ```js
 * // prints "Hello world!" on every 30 minutes
 * cronAdd("hello", "*\/30 * * * *", () => {
 *     console.log("Hello world!")
 * })
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function cronAdd(
  jobId:    string,
  cronExpr: string,
  handler:  () => void,
): void;

/**
 * CronRemove removes a single registered cron job by its name.
 *
 * Example:
 *
 * ```js
 * cronRemove("hello")
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function cronRemove(jobId: string): void;

// -------------------------------------------------------------------
// routerBinds
// -------------------------------------------------------------------

/**
 * RouterAdd registers a new route definition.
 *
 * Example:
 *
 * ```js
 * routerAdd("GET", "/hello", (e) => {
 *     return e.json(200, {"message": "Hello!"})
 * }, $apis.requireAuth())
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function routerAdd(
  method: string,
  path: string,
  handler: (e: core.RequestEvent) => void,
  ...middlewares: Array<string|((e: core.RequestEvent) => void)|Middleware>,
): void;

/**
 * RouterUse registers one or more global middlewares that are executed
 * along the handler middlewares after a matching route is found.
 *
 * Example:
 *
 * ```js
 * routerUse((e) => {
 *   console.log(e.request.url.path)
 *   return e.next()
 * })
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function routerUse(...middlewares: Array<string|((e: core.RequestEvent) => void)|Middleware>): void;

// -------------------------------------------------------------------
// baseBinds
// -------------------------------------------------------------------

/**
 * Global helper variable that contains the absolute path to the app pb_hooks directory.
 *
 * @group PocketBase... (717Korestants)
Réduire
message.txt
767 Ko
﻿
mashisuu
mashisu_
 
insta: mathis_jllrd
tiktok: m.yato
twitch: mashi_su
// 1757184118
// GENERATED CODE - DO NOT MODIFY BY HAND

// -------------------------------------------------------------------
// cronBinds
// -------------------------------------------------------------------

/**
 * CronAdd registers a new cron job.
 *
 * If a cron job with the specified name already exist, it will be
 * replaced with the new one.
 *
 * Example:
 *
 * ```js
 * // prints "Hello world!" on every 30 minutes
 * cronAdd("hello", "*\/30 * * * *", () => {
 *     console.log("Hello world!")
 * })
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function cronAdd(
  jobId:    string,
  cronExpr: string,
  handler:  () => void,
): void;

/**
 * CronRemove removes a single registered cron job by its name.
 *
 * Example:
 *
 * ```js
 * cronRemove("hello")
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function cronRemove(jobId: string): void;

// -------------------------------------------------------------------
// routerBinds
// -------------------------------------------------------------------

/**
 * RouterAdd registers a new route definition.
 *
 * Example:
 *
 * ```js
 * routerAdd("GET", "/hello", (e) => {
 *     return e.json(200, {"message": "Hello!"})
 * }, $apis.requireAuth())
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function routerAdd(
  method: string,
  path: string,
  handler: (e: core.RequestEvent) => void,
  ...middlewares: Array<string|((e: core.RequestEvent) => void)|Middleware>,
): void;

/**
 * RouterUse registers one or more global middlewares that are executed
 * along the handler middlewares after a matching route is found.
 *
 * Example:
 *
 * ```js
 * routerUse((e) => {
 *   console.log(e.request.url.path)
 *   return e.next()
 * })
 * ```
 *
 * _Note that this method is available only in pb_hooks context._
 *
 * @group PocketBase
 */
declare function routerUse(...middlewares: Array<string|((e: core.RequestEvent) => void)|Middleware>): void;

// -------------------------------------------------------------------
// baseBinds
// -------------------------------------------------------------------

/**
 * Global helper variable that contains the absolute path to the app pb_hooks directory.
 *
 * @group PocketBase
 */
declare var __hooks: string

// Utility type to exclude the on* hook methods from a type
// (hooks are separately generated as global methods).
//
// See https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
type excludeHooks<Type> = {
    [Property in keyof Type as Exclude<Property, `on${string}`|'cron'>]: Type[Property]
};

// CoreApp without the on* hook methods
type CoreApp = excludeHooks<core.App>

// PocketBase without the on* hook methods
type PocketBase = excludeHooks<pocketbase.PocketBase>

/**
 * `$app` is the current running PocketBase instance that is globally
 * available in each .pb.js file.
 *
 * _Note that this variable is available only in pb_hooks context._
 *
 * @namespace
 * @group PocketBase
 */
declare var $app: PocketBase

/**
 * `$template` is a global helper to load and cache HTML templates on the fly.
 *
 * The templates uses the standard Go [html/template](https://pkg.go.dev/html/template)
 * and [text/template](https://pkg.go.dev/text/template) package syntax.
 *
 * Example:
 *
 * ```js
 * const html = $template.loadFiles(
 *     "views/layout.html",
 *     "views/content.html",
 * ).render({"name": "John"})
 * ```
 *
 * @namespace
 * @group PocketBase
 */
declare var $template: template.Registry

/**
 * This method is superseded by toString.
 *
 * @deprecated
 * @group PocketBase
 */
declare function readerToString(reader: any, maxBytes?: number): string;

/**
 * toString stringifies the specified value.
 *
 * Support optional second maxBytes argument to limit the max read bytes
 * when the value is a io.Reader (default to 32MB).
 *
 * Types that don't have explicit string representation are json serialized.
 *
 * Example:
 *
 * ```js
 * // io.Reader
 * const ex1 = toString(e.request.body)
 *
 * // slice of bytes
 * const ex2 = toString([104 101 108 108 111]) // "hello"
 *
 * // null
 * const ex3 = toString(null) // ""
 * ```
 *
 * @group PocketBase
 */
declare function toString(val: any, maxBytes?: number): string;

/**
 * toBytes converts the specified value into a bytes slice.
 *
 * Support optional second maxBytes argument to limit the max read bytes
 * when the value is a io.Reader (default to 32MB).
 *
 * Types that don't have Go slice representation (bool, objects, etc.)
 * are serialized to UTF8 string and its bytes slice is returned.
 *
 * Example:
 *
 * ```js
 * // io.Reader
 * const ex1 = toBytes(e.request.body)
 *
 * // string
 * const ex2 = toBytes("hello") // [104 101 108 108 111]
 *
 * // object (the same as the string '{"test":1}')
 * const ex3 = toBytes({"test":1}) // [123 34 116 101 115 116 34 58 49 125]
 *
 * // null
 * const ex4 = toBytes(null) // []
 * ```
 *
 * @group PocketBase
 */
declare function toBytes(val: any, maxBytes?: number): Array<number>;

/**
 * sleep pauses the current goroutine for at least the specified user duration (in ms).
 * A zero or negative duration returns immediately.
 *
 * Example:
 *
 * ```js
 * sleep(250) // sleeps for 250ms
 * ```
 *
 * @group PocketBase
 */
declare function sleep(milliseconds: number): void;

/**
 * arrayOf creates a placeholder array of the specified models.
 * Usually used to populate DB result into an array of models.
 *
 * Example:
 *
 * ```js
 * const records = arrayOf(new Record)
 *
 * $app.recordQuery("articles").limit(10).all(records)
 * ```
 *
 * @group PocketBase
 */
declare function arrayOf<T>(model: T): Array<T>;

/**
 * DynamicModel creates a new dynamic model with fields from the provided data shape.
 *
 * Caveats:
 * - In order to use 0 as double/float initialization number you have to negate it (`-0`).
 * - You need to use lowerCamelCase when accessing the model fields (e.g. `model.roles` and not `model.Roles`).
 *
 * Example:
 *
 * ```js
 * const model = new DynamicModel({
 *     name:       ""
 *     age:        0,  // int64
 *     totalSpent: -0, // float64
 *     active:     false,
 *     Roles:      [], // maps to "Roles" in the DB/JSON but the prop would be accessible via "model.roles"
 *     meta:       {}
 * })
 * ```
 *
 * @group PocketBase
 */
declare class DynamicModel {
  constructor(shape?: { [key:string]: any })
}

interface Context extends context.Context{} // merge
/**
 * Context creates a new empty Go context.Context.
 *
 * This is usually used as part of some Go transitive bindings.
 *
 * Example:
 *
 * ```js
 * const blank = new Context()
 *
 * // with single key-value pair
 * const base = new Context(null, "a", 123)
 * console.log(base.value("a")) // 123
 *
 * // extend with additional key-value pair
 * const sub = new Context(base, "b", 456)
 * console.log(sub.value("a")) // 123
 * console.log(sub.value("b")) // 456
 * ```
 *
 * @group PocketBase
 */
declare class Context implements context.Context {
  constructor(parentCtx?: Context, key?: any, value?: any)
}

/**
 * Record model class.
 *
 * ```js
 * const collection = $app.findCollectionByNameOrId("article")
 *
 * const record = new Record(collection, {
 *     title: "Lorem ipsum"
 * })
 *
 * // or set field values after the initialization
 * record.set("description", "...")
 * ```
 *
 * @group PocketBase
 */
declare const Record: {
  new(collection?: core.Collection, data?: { [key:string]: any }): core.Record

  // note: declare as "newable" const due to conflict with the Record TS utility type
}

interface Collection extends core.Collection{
  type: "base" | "view" | "auth"
} // merge
/**
 * Collection model class.
 *
 * ```js
 * const collection = new Collection({
 *     type:       "base",
 *     name:       "article",
 *     listRule:   "@request.auth.id != '' || status = 'public'",
 *     viewRule:   "@request.auth.id != '' || status = 'public'",
 *     deleteRule: "@request.auth.id != ''",
 *     fields: [
 *         {
 *             name: "title",
 *             type: "text",
 *             required: true,
 *             min: 6,
 *             max: 100,
 *         },
 *         {
 *             name: "description",
 *             type: "text",
 *         },
 *     ]
 * })
 * ```
 *
 * @group PocketBase
 */
declare class Collection implements core.Collection {
  constructor(data?: Partial<Collection>)
}

interface FieldsList extends core.FieldsList{} // merge
/**
 * FieldsList model class, usually used to define the Collection.fields.
 *
 * @group PocketBase
 */
declare class FieldsList implements core.FieldsList {
  constructor(data?: Partial<core.FieldsList>)
}

interface Field extends core.Field{} // merge
/**
 * Field model class, usually used as part of the FieldsList model.
 *
 * @group PocketBase
 */
declare class Field implements core.Field {
  constructor(data?: Partial<core.Field>)
}

interface NumberField extends core.NumberField{} // merge
/**
 * {@inheritDoc core.NumberField}
 *
 * @group PocketBase
 */
declare class NumberField implements core.NumberField {
  constructor(data?: Partial<core.NumberField>)
}

interface BoolField extends core.BoolField{} // merge
/**
 * {@inheritDoc core.BoolField}
 *
 * @group PocketBase
 */
declare class BoolField implements core.BoolField {
  constructor(data?: Partial<core.BoolField>)
}

interface TextField extends core.TextField{} // merge
/**
 * {@inheritDoc core.TextField}
 *
 * @group PocketBase
 */
declare class TextField implements core.TextField {
  constructor(data?: Partial<core.TextField>)
}

interface URLField extends core.URLField{} // merge
/**
 * {@inheritDoc core.URLField}
 *
 * @group PocketBase
 */
declare class URLField implements core.URLField {
  constructor(data?: Partial<core.URLField>)
}

interface EmailField extends core.EmailField{} // merge
/**
 * {@inheritDoc core.EmailField}
 *
 * @group PocketBase
 */
declare class EmailField implements core.EmailField {
  constructor(data?: Partial<core.EmailField>)
}

interface EditorField extends core.EditorField{} // merge
/**
 * {@inheritDoc core.EditorField}
 *
 * @group PocketBase
 */
declare class EditorField implements core.EditorField {
  constructor(data?: Partial<core.EditorField>)
}

interface PasswordField extends core.PasswordField{} // merge
/**
 * {@inheritDoc core.PasswordField}
 *
 * @group PocketBase
 */
declare class PasswordField implements core.PasswordField {
  constructor(data?: Partial<core.PasswordField>)
}

interface DateField extends core.DateField{} // merge
/**
 * {@inheritDoc core.DateField}
 *
 * @group PocketBase
 */
declare class DateField implements core.DateField {
  constructor(data?: Partial<core.DateField>)
}

interface AutodateField extends core.AutodateField{} // merge
/**
 * {@inheritDoc core.AutodateField}
 *
 * @group PocketBase
 */
declare class AutodateField implements core.AutodateField {
  constructor(data?: Partial<core.AutodateField>)
}

interface JSONField extends core.JSONField{} // merge
/**
 * {@inheritDoc core.JSONField}
 *
 * @group PocketBase
 */
declare class JSONField implements core.JSONField {
  constructor(data?: Partial<core.JSONField>)
}

interface RelationField extends core.RelationField{} // merge
/**
 * {@inheritDoc core.RelationField}
 *
 * @group PocketBase
 */
declare class RelationField implements core.RelationField {
  constructor(data?: Partial<core.RelationField>)
}

interface SelectField extends core.SelectField{} // merge
/**
 * {@inheritDoc core.SelectField}
 *
 * @group PocketBase
 */
declare class SelectField implements core.SelectField {
  constructor(data?: Partial<core.SelectField>)
}

interface FileField extends core.FileField{} // merge
/**
 * {@inheritDoc core.FileField}
 *
 * @group PocketBase
 */
declare class FileField implements core.FileField {
  constructor(data?: Partial<core.FileField>)
}

interface GeoPointField extends core.GeoPointField{} // merge
/**
 * {@inheritDoc core.GeoPointField}
 *
 * @group PocketBase
 */
declare class GeoPointField implements core.GeoPointField {
  constructor(data?: Partial<core.GeoPointField>)
}

interface MailerMessage extends mailer.Message{} // merge
/**
 * MailerMessage defines a single email message.
 *
 * ```js
 * const message = new MailerMessage({
 *     from: {
 *         address: $app.settings().meta.senderAddress,
 *         name:    $app.settings().meta.senderName,
 *     },
 *     to:      [{address: "test@example.com"}],
 *     subject: "YOUR_SUBJECT...",
 *     html:    "YOUR_HTML_BODY...",
 * })
 *
 * $app.newMailClient().send(message)
 * ```
 *
 * @group PocketBase
 */
declare class MailerMessage implements mailer.Message {
  constructor(message?: Partial<mailer.Message>)
}

interface Command extends cobra.Command{} // merge
/**
 * Command defines a single console command.
 *
 * Example:
 *
 * ```js
 * const command = new Command({
 *     use: "hello",
 *     run: (cmd, args) => { console.log("Hello world!") },
 * })
 *
 * $app.rootCmd.addCommand(command);
 * ```
 *
 * @group PocketBase
 */
declare class Command implements cobra.Command {
  constructor(cmd?: Partial<cobra.Command>)
}

/**
 * RequestInfo defines a single core.RequestInfo instance, usually used
 * as part of various filter checks.
 *
 * Example:
 *
 * ```js
 * const authRecord = $app.findAuthRecordByEmail("users", "test@example.com")
 *
 * const info = new RequestInfo({
 *     auth:    authRecord,
 *     body:    {"name": 123},
 *     headers: {"x-token": "..."},
 * })
 *
 * const record = $app.findFirstRecordByData("articles", "slug", "hello")
 *
 * const canAccess = $app.canAccessRecord(record, info, "@request.auth.id != '' && @request.body.name = 123")
 * ```
 *
 * @group PocketBase
 */
declare const RequestInfo: {
  new(info?: Partial<core.RequestInfo>): core.RequestInfo

 // note: declare as "newable" const due to conflict with the RequestInfo TS node type
}

/**
 * Middleware defines a single request middleware handler.
 *
 * This class is usually used when you want to explicitly specify a priority to your custom route middleware.
 *
 * Example:
 *
 * ```js
 * routerUse(new Middleware((e) => {
 *   console.log(e.request.url.path)
 *   return e.next()
 * }, -10))
 * ```
 *
 * @group PocketBase
 */
declare class Middleware {
  constructor(
    func: string|((e: core.RequestEvent) => void),
    priority?: number,
    id?: string,
  )
}

interface Timezone extends time.Location{} // merge
/**
 * Timezone returns the timezone location with the given name.
 *
 * The name is expected to be a location name corresponding to a file
 * in the IANA Time Zone database, such as "America/New_York".
 *
 * If the name is "Local", LoadLocation returns Local.
 *
 * If the name is "", invalid or "UTC", returns UTC.
 *
 * The constructor is equivalent to calling the Go `time.LoadLocation(name)` method.
 *
 * Example:
 *
 * ```js
 * const zone = new Timezone("America/New_York")
 * $app.cron().setTimezone(zone)
 * ```
 *
 * @group PocketBase
 */
declare class Timezone implements time.Location {
  constructor(name?: string)
}

interface DateTime extends types.DateTime{} // merge
/**
 * DateTime defines a single DateTime type instance.
 * The returned date is always represented in UTC.
 *
 * Example:
 *
 * ```js
 * const dt0 = new DateTime() // now
 *
 * // full datetime string
 * const dt1 = new DateTime('2023-07-01 00:00:00.000Z')
 *
 * // datetime string with default "parse in" timezone location
 * //
 * // similar to new DateTime('2023-07-01 00:00:00 +01:00') or new DateTime('2023-07-01 00:00:00 +02:00')
 * // but accounts for the daylight saving time (DST)
 * const dt2 = new DateTime('2023-07-01 00:00:00', 'Europe/Amsterdam')
 * ```
 *
 * @group PocketBase
 */
declare class DateTime implements types.DateTime {
  constructor(date?: string, defaultParseInLocation?: string)
}

interface ValidationError extends ozzo_validation.Error{} // merge
/**
 * ValidationError defines a single formatted data validation error,
 * usually used as part of an error response.
 *
 * ```js
 * new ValidationError("invalid_title", "Title is not valid")
 * ```
 *
 * @group PocketBase
 */
declare class ValidationError implements ozzo_validation.Error {
  constructor(code?: string, message?: string)
}

interface Cookie extends http.Cookie{} // merge
/**
 * A Cookie represents an HTTP cookie as sent in the Set-Cookie header of an
 * HTTP response.
 *
 * Example:
 *
 * ```js
 * routerAdd("POST", "/example", (c) => {
 *     c.setCookie(new Cookie({
 *         name:     "example_name",
 *         value:    "example_value",
 *         path:     "/",
 *         domain:   "example.com",
 *         maxAge:   10,
 *         secure:   true,
 *         httpOnly: true,
 *         sameSite: 3,
 *     }))
 *
 *     return c.redirect(200, "/");
 * })
 * ```
 *
 * @group PocketBase
 */
declare class Cookie implements http.Cookie {
  constructor(options?: Partial<http.Cookie>)
}

interface SubscriptionMessage extends subscriptions.Message{} // merge
/**
 * SubscriptionMessage defines a realtime subscription payload.
 *
 * Example:
 *
 * ```js
 * onRealtimeConnectRequest((e) => {
 *     e.client.send(new SubscriptionMessage({
 *         name: "example",
 *         data: '{"greeting": "Hello world"}'
 *     }))
 * })
 * ```
 *
 * @group PocketBase
 */
declare class SubscriptionMessage implements subscriptions.Message {
  constructor(options?: Partial<subscriptions.Message>)
}

// -------------------------------------------------------------------
// dbxBinds
// -------------------------------------------------------------------

/**
 * `$dbx` defines common utility for working with the DB abstraction.
 * For examples and guides please check the [Database guide](https://pocketbase.io/docs/js-database).
 *
 * @group PocketBase
 */
declare namespace $dbx {
  /**
   * {@inheritDoc dbx.HashExp}
   */
  export function hashExp(pairs: { [key:string]: any }): dbx.Expression

  let _in: dbx._in
  export { _in as in }

  export let exp:        dbx.newExp
  export let not:        dbx.not
  export let and:        dbx.and
  export let or:         dbx.or
  export let notIn:      dbx.notIn
  export let like:       dbx.like
  export let orLike:     dbx.orLike
  export let notLike:    dbx.notLike
  export let orNotLike:  dbx.orNotLike
  export let exists:     dbx.exists
  export let notExists:  dbx.notExists
  export let between:    dbx.between
  export let notBetween: dbx.notBetween
}

// -------------------------------------------------------------------
// mailsBinds
// -------------------------------------------------------------------

/**
 * `$mails` defines helpers to send common
 * auth records emails like verification, password reset, etc.
 *
 * @group PocketBase
 */
declare namespace $mails {
  let sendRecordPasswordReset: mails.sendRecordPasswordReset
  let sendRecordVerification:  mails.sendRecordVerification
  let sendRecordChangeEmail:   mails.sendRecordChangeEmail
  let sendRecordOTP:           mails.sendRecordOTP
}

// -------------------------------------------------------------------
// securityBinds
// -------------------------------------------------------------------

/**
 * `$security` defines low level helpers for creating
 * and parsing JWTs, random string generation, AES encryption, etc.
 *
 * @group PocketBase
 */
declare namespace $security {
  let randomString:                   security.randomString
  let randomStringWithAlphabet:       security.randomStringWithAlphabet
  let randomStringByRegex:            security.randomStringByRegex
  let pseudorandomString:             security.pseudorandomString
  let pseudorandomStringWithAlphabet: security.pseudorandomStringWithAlphabet
  let encrypt:                        security.encrypt
  let decrypt:                        security.decrypt
  let hs256:                          security.hs256
  let hs512:                          security.hs512
  let equal:                          security.equal
  let md5:                            security.md5
  let sha256:                         security.sha256
  let sha512:                         security.sha512

  /**
   * {@inheritDoc security.newJWT}
   */
  export function createJWT(payload: { [key:string]: any }, signingKey: string, secDuration: number): string

  /**
   * {@inheritDoc security.parseUnverifiedJWT}
   */
  export function parseUnverifiedJWT(token: string): _TygojaDict

  /**
   * {@inheritDoc security.parseJWT}
   */
  export function parseJWT(token: string, verificationKey: string): _TygojaDict
}

// -------------------------------------------------------------------
// filesystemBinds
// -------------------------------------------------------------------

/**
 * `$filesystem` defines common helpers for working
 * with the PocketBase filesystem abstraction.
 *
 * @group PocketBase
 */
declare namespace $filesystem {
  let fileFromPath:      filesystem.newFileFromPath
  let fileFromBytes:     filesystem.newFileFromBytes
  let fileFromMultipart: filesystem.newFileFromMultipart

  /**
   * fileFromURL creates a new File from the provided url by
   * downloading the resource and creating a BytesReader.
   *
   * Example:
   *
   * ```js
   * // with default max timeout of 120sec
   * const file1 = $filesystem.fileFromURL("https://...")
   *
   * // with custom timeout of 15sec
   * const file2 = $filesystem.fileFromURL("https://...", 15)
   * ```
   */
  export function fileFromURL(url: string, secTimeout?: number): filesystem.File
}

// -------------------------------------------------------------------
// filepathBinds
// -------------------------------------------------------------------

/**
 * `$filepath` defines common helpers for manipulating filename
 * paths in a way compatible with the target operating system-defined file paths.
 *
 * @group PocketBase
 */
declare namespace $filepath {
  export let base:      filepath.base
  export let clean:     filepath.clean
  export let dir:       filepath.dir
  export let ext:       filepath.ext
  export let fromSlash: filepath.fromSlash
  export let glob:      filepath.glob
  export let isAbs:     filepath.isAbs
  export let join:      filepath.join
  export let match:     filepath.match
  export let rel:       filepath.rel
  export let split:     filepath.split
  export let splitList: filepath.splitList
  export let toSlash:   filepath.toSlash
  export let walk:      filepath.walk
  export let walkDir:   filepath.walkDir
}

// -------------------------------------------------------------------
// osBinds
// -------------------------------------------------------------------

/**
 * `$os` defines common helpers for working with the OS level primitives
 * (eg. deleting directories, executing shell commands, etc.).
 *
 * @group PocketBase
 */
declare namespace $os {
  /**
   * Legacy alias for $os.cmd().
   */
  export let exec: exec.command

  /**
   * Prepares an external OS command.
   *
   * Example:
   *
   * ```js
   * // prepare the command to execute
   * const cmd = $os.cmd('ls', '-sl')
   *
   * // execute the command and return its standard output as string
   * const output = toString(cmd.output());
   * ```
   */
  export let cmd: exec.command

  /**
   * Args hold the command-line arguments, starting with the program name.
   */
  export let args: Array<string>

  export let exit:       os.exit
  export let getenv:     os.getenv
  export let dirFS:      os.dirFS
  export let readFile:   os.readFile
  export let writeFile:  os.writeFile
  export let stat:       os.stat
  export let readDir:    os.readDir
  export let tempDir:    os.tempDir
  export let truncate:   os.truncate
  export let getwd:      os.getwd
  export let mkdir:      os.mkdir
  export let mkdirAll:   os.mkdirAll
  export let rename:     os.rename
  export let remove:     os.remove
  export let removeAll:  os.removeAll
  export let openRoot:   os.openRoot
  export let openInRoot: os.openInRoot
}

// -------------------------------------------------------------------
// formsBinds
// -------------------------------------------------------------------

interface AppleClientSecretCreateForm extends forms.AppleClientSecretCreate{} // merge
/**
 * @inheritDoc
 * @group PocketBase
 */
declare class AppleClientSecretCreateForm implements forms.AppleClientSecretCreate {
  constructor(app: CoreApp)
}

interface RecordUpsertForm extends forms.RecordUpsert{} // merge
/**
 * @inheritDoc
 * @group PocketBase
 */
declare class RecordUpsertForm implements forms.RecordUpsert {
  constructor(app: CoreApp, record: core.Record)
}

interface TestEmailSendForm extends forms.TestEmailSend{} // merge
/**
 * @inheritDoc
 * @group PocketBase
 */
declare class TestEmailSendForm implements forms.TestEmailSend {
  constructor(app: CoreApp)
}

interface TestS3FilesystemForm extends forms.TestS3Filesystem{} // merge
/**
 * @inheritDoc
 * @group PocketBase
 */
declare class TestS3FilesystemForm implements forms.TestS3Filesystem {
  constructor(app: CoreApp)
}

// -------------------------------------------------------------------
// apisBinds
// -------------------------------------------------------------------

interface ApiError extends router.ApiError{} // merge
/**
 * @inheritDoc
 *
 * @group PocketBase
 */
declare class ApiError implements router.ApiError {
  constructor(status?: number, message?: string, data?: any)
}

interface NotFoundError extends router.ApiError{} // merge
/**
 * NotFounderor returns 404 ApiError.
 *
 * @group PocketBase
 */
declare class NotFoundError implements router.ApiError {
  constructor(message?: string, data?: any)
}

interface BadRequestError extends router.ApiError{} // merge
/**
 * BadRequestError returns 400 ApiError.
 *
 * @group PocketBase
 */
declare class BadRequestError implements router.ApiError {
  constructor(message?: string, data?: any)
}

interface ForbiddenError extends router.ApiError{} // merge
/**
 * ForbiddenError returns 403 ApiError.
 *
 * @group PocketBase
 */
declare class ForbiddenError implements router.ApiError {
  constructor(message?: string, data?: any)
}

interface UnauthorizedError extends router.ApiError{} // merge
/**
 * UnauthorizedError returns 401 ApiError.
 *
 * @group PocketBase
 */
declare class UnauthorizedError implements router.ApiError {
  constructor(message?: string, data?: any)
}

interface TooManyRequestsError extends router.ApiError{} // merge
/**
 * TooManyRequestsError returns 429 ApiError.
 *
 * @group PocketBase
 */
declare class TooManyRequestsError implements router.ApiError {
  constructor(message?: string, data?: any)
}

interface InternalServerError extends router.ApiError{} // merge
/**
 * InternalServerError returns 429 ApiError.
 *
 * @group PocketBase
 */
declare class InternalServerError implements router.ApiError {
  constructor(message?: string, data?: any)
}

/**
 * `$apis` defines commonly used PocketBase api helpers and middlewares.
 *
 * @group PocketBase
 */
declare namespace $apis {
  /**
   * Route handler to serve static directory content (html, js, css, etc.).
   *
   * If a file resource is missing and indexFallback is set, the request
   * will be forwarded to the base index.html (useful for SPA).
   */
  export function static(dir: string, indexFallback: boolean): (e: core.RequestEvent) => void

  let requireGuestOnly:              apis.requireGuestOnly
  let requireAuth:                   apis.requireAuth
  let requireSuperuserAuth:          apis.requireSuperuserAuth
  let requireSuperuserOrOwnerAuth:   apis.requireSuperuserOrOwnerAuth
  let skipSuccessActivityLog:        apis.skipSuccessActivityLog
  let gzip:                          apis.gzip
  let bodyLimit:                     apis.bodyLimit
  let enrichRecord:                  apis.enrichRecord
  let enrichRecords:                 apis.enrichRecords

  /**
   * RecordAuthResponse writes standardized json record auth response
   * into the specified request event.
   *
   * The authMethod argument specify the name of the current authentication method (eg. password, oauth2, etc.)
   * that it is used primarily as an auth identifier during MFA and for login alerts.
   *
   * Set authMethod to empty string if you want to ignore the MFA checks and the login alerts
   * (can be also adjusted additionally via the onRecordAuthRequest hook).
   */
  export function recordAuthResponse(e: core.RequestEvent, authRecord: core.Record, authMethod: string, meta?: any): void
}

// -------------------------------------------------------------------
// httpClientBinds
// -------------------------------------------------------------------

// extra FormData overload to prevent TS warnings when used with non File/Blob value.
interface FormData {
  append(key:string, value:any): void
  set(key:string, value:any): void
}

/**
 * `$http` defines common methods for working with HTTP requests.
 *
 * @group PocketBase
 */
declare namespace $http {
  /**
   * Sends a single HTTP request.
   *
   * Example:
   *
   * ```js
   * const res = $http.send({
   *     method:  "POST",
   *     url:     "https://example.com",
   *     body:    JSON.stringify({"title": "test"}),
   *     headers: { 'Content-Type': 'application/json' }
   * })
   *
   * console.log(res.statusCode) // the response HTTP status code
   * console.log(res.headers)    // the response headers (eg. res.headers['X-Custom'][0])
   * console.log(res.cookies)    // the response cookies (eg. res.cookies.sessionId.value)
   * console.log(res.body)       // the response body as raw bytes slice
   * console.log(res.json)       // the response body as parsed json array or map
   * ```
   */
  function send(config: {
    url:      string,
    body?:    string|FormData,
    method?:  string, // default to "GET"
    headers?: { [key:string]: string },
    timeout?: number, // default to 120

    // @deprecated please use body instead
    data?: { [key:string]: any },
  }): {
    statusCode: number,
    headers:    { [key:string]: Array<string> },
    cookies:    { [key:string]: http.Cookie },
    json:       any,
    body:       Array<number>,

    // @deprecated please use toString(result.body) instead
    raw: string,
  };
}

// -------------------------------------------------------------------
// migrate only
// -------------------------------------------------------------------

/**
 * Migrate defines a single migration upgrade/downgrade action.
 *
 * _Note that this method is available only in pb_migrations context._
 *
 * @group PocketBase
 */
declare function migrate(
  up: (txApp: CoreApp) => void,
  down?: (txApp: CoreApp) => void
): void;
/** @group PocketBase */declare function onBackupCreate(handler: (e: core.BackupEvent) => void): void
/** @group PocketBase */declare function onBackupRestore(handler: (e: core.BackupEvent) => void): void
/** @group PocketBase */declare function onBatchRequest(handler: (e: core.BatchRequestEvent) => void): void
/** @group PocketBase */declare function onBootstrap(handler: (e: core.BootstrapEvent) => void): void
/** @group PocketBase */declare function onCollectionAfterCreateError(handler: (e: core.CollectionErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionAfterCreateSuccess(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionAfterDeleteError(handler: (e: core.CollectionErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionAfterDeleteSuccess(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionAfterUpdateError(handler: (e: core.CollectionErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionAfterUpdateSuccess(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionCreate(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionCreateExecute(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionCreateRequest(handler: (e: core.CollectionRequestEvent) => void): void
/** @group PocketBase */declare function onCollectionDelete(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionDeleteExecute(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionDeleteRequest(handler: (e: core.CollectionRequestEvent) => void): void
/** @group PocketBase */declare function onCollectionUpdate(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionUpdateExecute(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionUpdateRequest(handler: (e: core.CollectionRequestEvent) => void): void
/** @group PocketBase */declare function onCollectionValidate(handler: (e: core.CollectionEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onCollectionViewRequest(handler: (e: core.CollectionRequestEvent) => void): void
/** @group PocketBase */declare function onCollectionsImportRequest(handler: (e: core.CollectionsImportRequestEvent) => void): void
/** @group PocketBase */declare function onCollectionsListRequest(handler: (e: core.CollectionsListRequestEvent) => void): void
/** @group PocketBase */declare function onFileDownloadRequest(handler: (e: core.FileDownloadRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onFileTokenRequest(handler: (e: core.FileTokenRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onMailerRecordAuthAlertSend(handler: (e: core.MailerRecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onMailerRecordEmailChangeSend(handler: (e: core.MailerRecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onMailerRecordOTPSend(handler: (e: core.MailerRecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onMailerRecordPasswordResetSend(handler: (e: core.MailerRecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onMailerRecordVerificationSend(handler: (e: core.MailerRecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onMailerSend(handler: (e: core.MailerEvent) => void): void
/** @group PocketBase */declare function onModelAfterCreateError(handler: (e: core.ModelErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelAfterCreateSuccess(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelAfterDeleteError(handler: (e: core.ModelErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelAfterDeleteSuccess(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelAfterUpdateError(handler: (e: core.ModelErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelAfterUpdateSuccess(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelCreate(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelCreateExecute(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelDelete(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelDeleteExecute(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelUpdate(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelUpdateExecute(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onModelValidate(handler: (e: core.ModelEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRealtimeConnectRequest(handler: (e: core.RealtimeConnectRequestEvent) => void): void
/** @group PocketBase */declare function onRealtimeMessageSend(handler: (e: core.RealtimeMessageEvent) => void): void
/** @group PocketBase */declare function onRealtimeSubscribeRequest(handler: (e: core.RealtimeSubscribeRequestEvent) => void): void
/** @group PocketBase */declare function onRecordAfterCreateError(handler: (e: core.RecordErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAfterCreateSuccess(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAfterDeleteError(handler: (e: core.RecordErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAfterDeleteSuccess(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAfterUpdateError(handler: (e: core.RecordErrorEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAfterUpdateSuccess(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAuthRefreshRequest(handler: (e: core.RecordAuthRefreshRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAuthRequest(handler: (e: core.RecordAuthRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAuthWithOAuth2Request(handler: (e: core.RecordAuthWithOAuth2RequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAuthWithOTPRequest(handler: (e: core.RecordAuthWithOTPRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordAuthWithPasswordRequest(handler: (e: core.RecordAuthWithPasswordRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordConfirmEmailChangeRequest(handler: (e: core.RecordConfirmEmailChangeRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordConfirmPasswordResetRequest(handler: (e: core.RecordConfirmPasswordResetRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordConfirmVerificationRequest(handler: (e: core.RecordConfirmVerificationRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordCreate(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordCreateExecute(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordCreateRequest(handler: (e: core.RecordRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordDelete(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordDeleteExecute(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordDeleteRequest(handler: (e: core.RecordRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordEnrich(handler: (e: core.RecordEnrichEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordRequestEmailChangeRequest(handler: (e: core.RecordRequestEmailChangeRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordRequestOTPRequest(handler: (e: core.RecordCreateOTPRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordRequestPasswordResetRequest(handler: (e: core.RecordRequestPasswordResetRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordRequestVerificationRequest(handler: (e: core.RecordRequestVerificationRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordUpdate(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordUpdateExecute(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordUpdateRequest(handler: (e: core.RecordRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordValidate(handler: (e: core.RecordEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordViewRequest(handler: (e: core.RecordRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onRecordsListRequest(handler: (e: core.RecordsListRequestEvent) => void, ...tags: string[]): void
/** @group PocketBase */declare function onSettingsListRequest(handler: (e: core.SettingsListRequestEvent) => void): void
/** @group PocketBase */declare function onSettingsReload(handler: (e: core.SettingsReloadEvent) => void): void
/** @group PocketBase */declare function onSettingsUpdateRequest(handler: (e: core.SettingsUpdateRequestEvent) => void): void
/** @group PocketBase */declare function onTerminate(handler: (e: core.TerminateEvent) => void): void
type _TygojaDict = { [key:string | number | symbol]: any; }
type _TygojaAny = any

/**
 * Package os provides a platform-independent interface to operating system
 * functionality. The design is Unix-like, although the error handling is
 * Go-like; failing calls return values of type error rather than error numbers.
 * Often, more information is available within the error. For example,
 * if a call that takes a file name fails, such as [Open] or [Stat], the error
 * will include the failing file name when printed and will be of type
 * [*PathError], which may be unpacked for more information.
 * 
 * The os interface is intended to be uniform across all operating systems.
 * Features not generally available appear in the system-specific package syscall.
 * 
 * Here is a simple example, opening a file and reading some of it.
 * 
 * ```
 * 	file, err := os.Open("file.go") // For read access.
 * 	if err != nil {
 * 		log.Fatal(err)
 * 	}
 * ```
 * 
 * If the open fails, the error string will be self-explanatory, like
 * 
 * ```
 * 	open file.go: no such file or directory
 * ```
 * 
 * The file's data can then be read into a slice of bytes. Read and
 * Write take their byte counts from the length of the argument slice.
 * 
 * ```
 * 	data := make([]byte, 100)
 * 	count, err := file.Read(data)
 * 	if err != nil {
 * 		log.Fatal(err)
 * 	}
 * 	fmt.Printf("read %d bytes: %q\n", count, data[:count])
 * ```
 * 
 * # Concurrency
 * 
 * The methods of [File] correspond to file system operations. All are
 * safe for concurrent use. The maximum number of concurrent
 * operations on a File may be limited by the OS or the system. The
 * number should be high, but exceeding it may degrade performance or
 * cause other issues.
 */
namespace os {
 interface readdirMode extends Number{}
 interface File {
  /**
   * Readdir reads the contents of the directory associated with file and
   * returns a slice of up to n [FileInfo] values, as would be returned
   * by [Lstat], in directory order. Subsequent calls on the same file will yield
   * further FileInfos.
   * 
   * If n > 0, Readdir returns at most n FileInfo structures. In this case, if
   * Readdir returns an empty slice, it will return a non-nil error
   * explaining why. At the end of a directory, the error is [io.EOF].
   * 
   * If n <= 0, Readdir returns all the FileInfo from the directory in
   * a single slice. In this case, if Readdir succeeds (reads all
   * the way to the end of the directory), it returns the slice and a
   * nil error. If it encounters an error before the end of the
   * directory, Readdir returns the FileInfo read until that point
   * and a non-nil error.
   * 
   * Most clients are better served by the more efficient ReadDir method.
   */
  readdir(n: number): Array<FileInfo>
 }
 interface File {
  /**
   * Readdirnames reads the contents of the directory associated with file
   * and returns a slice of up to n names of files in the directory,
   * in directory order. Subsequent calls on the same file will yield
   * further names.
   * 
   * If n > 0, Readdirnames returns at most n names. In this case, if
   * Readdirnames returns an empty slice, it will return a non-nil error
   * explaining why. At the end of a directory, the error is [io.EOF].
   * 
   * If n <= 0, Readdirnames returns all the names from the directory in
   * a single slice. In this case, if Readdirnames succeeds (reads all
   * the way to the end of the directory), it returns the slice and a
   * nil error. If it encounters an error before the end of the
   * directory, Readdirnames returns the names read until that point and
   * a non-nil error.
   */
  readdirnames(n: number): Array<string>
 }
 /**
  * A DirEntry is an entry read from a directory
  * (using the [ReadDir] function or a [File.ReadDir] method).
  */
 interface DirEntry extends fs.DirEntry{}
 interface File {
  /**
   * ReadDir reads the contents of the directory associated with the file f
   * and returns a slice of [DirEntry] values in directory order.
   * Subsequent calls on the same file will yield later DirEntry records in the directory.
   * 
   * If n > 0, ReadDir returns at most n DirEntry records.
   * In this case, if ReadDir returns an empty slice, it will return an error explaining why.
   * At the end of a directory, the error is [io.EOF].
   * 
   * If n <= 0, ReadDir returns all the DirEntry records remaining in the directory.
   * When it succeeds, it returns a nil error (not io.EOF).
   */
  readDir(n: number): Array<DirEntry>
 }
 interface readDir {
  /**
   * ReadDir reads the named directory,
   * returning all its directory entries sorted by filename.
   * If an error occurs reading the directory,
   * ReadDir returns the entries it was able to read before the error,
   * along with the error.
   */
  (name: string): Array<DirEntry>
 }
 interface copyFS {
  /**
   * CopyFS copies the file system fsys into the directory dir,
   * creating dir if necessary.
   * 
   * Files are created with mode 0o666 plus any execute permissions
   * from the source, and directories are created with mode 0o777
   * (before umask).
   * 
   * CopyFS will not overwrite existing files. If a file name in fsys
   * already exists in the destination, CopyFS will return an error
   * such that errors.Is(err, fs.ErrExist) will be true.
   * 
   * Symbolic links in fsys are not supported. A *PathError with Err set
   * to ErrInvalid is returned when copying from a symbolic link.
   * 
   * Symbolic links in dir are followed.
   * 
   * New files added to fsys (including if dir is a subdirectory of fsys)
   * while CopyFS is running are not guaranteed to be copied.
   * 
   * Copying stops at and returns the first error encountered.
   */
  (dir: string, fsys: fs.FS): void
 }
 /**
  * Auxiliary information if the File describes a directory
  */
 interface dirInfo {
 }
 interface expand {
  /**
   * Expand replaces ${var} or $var in the string based on the mapping function.
   * For example, [os.ExpandEnv](s) is equivalent to [os.Expand](s, [os.Getenv]).
   */
  (s: string, mapping: (_arg0: string) => string): string
 }
 interface expandEnv {
  /**
   * ExpandEnv replaces ${var} or $var in the string according to the values
   * of the current environment variables. References to undefined
   * variables are replaced by the empty string.
   */
  (s: string): string
 }
 interface getenv {
  /**
   * Getenv retrieves the value of the environment variable named by the key.
   * It returns the value, which will be empty if the variable is not present.
   * To distinguish between an empty value and an unset value, use [LookupEnv].
   */
  (key: string): string
 }
 interface lookupEnv {
  /**
   * LookupEnv retrieves the value of the environment variable named
   * by the key. If the variable is present in the environment the
   * value (which may be empty) is returned and the boolean is true.
   * Otherwise the returned value will be empty and the boolean will
   * be false.
   */
  (key: string): [string, boolean]
 }
 interface setenv {
  /**
   * Setenv sets the value of the environment variable named by the key.
   * It returns an error, if any.
   */
  (key: string, value: string): void
 }
 interface unsetenv {
  /**
   * Unsetenv unsets a single environment variable.
   */
  (key: string): void
 }
 interface clearenv {
  /**
   * Clearenv deletes all environment variables.
   */
  (): void
 }
 interface environ {
  /**
   * Environ returns a copy of strings representing the environment,
   * in the form "key=value".
   */
  (): Array<string>
 }
 interface timeout {
  [key:string]: any;
  timeout(): boolean
 }
 /**
  * PathError records an error and the operation and file path that caused it.
  */
 interface PathError extends fs.PathError{}
 /**
  * SyscallError records an error from a specific system call.
  */
 interface SyscallError {
  syscall: string
  err: Error
 }
 interface SyscallError {
  error(): string
 }
 interface SyscallError {
  unwrap(): void
 }
 interface SyscallError {
  /**
   * Timeout reports whether this error represents a timeout.
   */
  timeout(): boolean
 }
 interface newSyscallError {
  /**
   * NewSyscallError returns, as an error, a new [SyscallError]
   * with the given system call name and error details.
   * As a convenience, if err is nil, NewSyscallError returns nil.
   */
  (syscall: string, err: Error): void
 }
 interface isExist {
... (717 Ko restants)
message.txt
767 Ko