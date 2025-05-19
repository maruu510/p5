git checkout -b feature/loading-component
git add .
git commit -m "Agregado componente de loading y mejoras en la interfaz"
git push origin feature/loading-component

- Con permisos para entorno y red (recomendado):

```bash
deno run --allow-env --allow-net main.ts
```



## Merge con estrategia ours
Esta opción fusiona la rama SCRUM-200 en main , pero mantiene todos los cambios de SCRUM-200 :
git checkout main
git merge --strategy=ours SCRUM-200
git push origin main