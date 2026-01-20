#!/bin/sh

echo "RUN npm install"
npm install --verbose

npm run dev-exposed &
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch