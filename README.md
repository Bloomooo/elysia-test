# Moteur de Tarification — TP Seance 2

Moteur de tarification d'une plateforme de livraison de repas (type Uber Eats). Calcule le prix d'une commande en fonction de la distance, du poids, de l'heure, du jour et des codes promo.

## Stack

- **Runtime** : [Bun](https://bun.sh)
- **Framework** : [Elysia.js](https://elysiajs.com)
- **Tests** : bun:test (built-in)
- **Linter** : ESLint
- **CI** : GitHub Actions

## Installation

```bash
bun install
```

## Commandes

```bash
# Lancer le serveur (port 3000)
bun run start

# Lancer le serveur en mode watch
bun run dev

# Lancer les tests
bun run test

# Lancer les tests avec couverture (seuil 80%)
bun run test:coverage

# Lancer le linter
bun run lint
```

## Routes API

| Methode | Route              | Description                                      |
|---------|--------------------|--------------------------------------------------|
| POST    | `/orders/simulate` | Calcul du prix sans enregistrer la commande       |
| POST    | `/orders`          | Enregistre la commande et retourne son ID         |
| GET     | `/orders/:id`      | Recupere une commande par son ID (404 si absente) |
| POST    | `/promo/validate`  | Verifie la validite d'un code promo               |

### Exemple — POST /orders/simulate

```json
{
  "items": [{ "name": "Pizza", "price": 12.50, "quantity": 2 }],
  "distance": 5,
  "weight": 2,
  "promoCode": "BIENVENUE20",
  "hour": 15,
  "dayOfWeek": "tuesday"
}
```

Reponse :

```json
{
  "subtotal": 25,
  "discount": 5,
  "deliveryFee": 3,
  "surge": 1,
  "total": 23
}
```

## Structure du projet

```
src/
├── index.ts        # Demarrage du serveur (.listen)
├── app.ts          # App Elysia (routes)
├── utils.ts        # Fonctions utilitaires
├── validators.ts   # Fonctions de validation
├── pricing.ts      # Moteur de tarification
└── store.ts        # Stockage en memoire des commandes
tests/
├── utils.test.ts
├── validators.test.ts
├── pricing.test.ts
└── integration.test.ts
```

## Regles metier — Tarification

- **Frais de livraison** : base 2€, +0.50€/km au-dela de 3km, refuse au-dela de 10km, +1.50€ si poids > 5kg
- **Codes promo** : pourcentage ou montant fixe, avec date d'expiration et commande minimum
- **Surge pricing** : multiplicateur sur les frais de livraison selon l'heure et le jour (1.0 a 1.8, ferme avant 10h et apres 22h)
- **Total** : sous-total - reduction + frais de livraison × surge
