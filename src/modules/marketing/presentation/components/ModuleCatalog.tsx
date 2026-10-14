'use client'

import { useState } from 'react'
import {
  moduleCategories,
  platformModules,
  type ModuleCategoryId,
} from '../content/marketingContent'
import styles from './ModuleCatalog.module.css'

export default function ModuleCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategoryId | 'todas'>('todas')
  const visibleModules = platformModules.filter(
    ({ categoryId }) => selectedCategory === 'todas' || categoryId === selectedCategory,
  )

  return (
    <div className={styles.catalog}>
      <div aria-label="Filtrar módulos por área" className={styles.filters} role="group">
        <button
          aria-pressed={selectedCategory === 'todas'}
          className={styles.filter}
          onClick={() => setSelectedCategory('todas')}
          type="button"
        >
          Todas las áreas
        </button>
        {moduleCategories.map((category) => (
          <button
            aria-pressed={selectedCategory === category.id}
            className={styles.filter}
            data-tone={category.tone}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      <p aria-live="polite" className={styles.count}>
        {visibleModules.length} {visibleModules.length === 1 ? 'módulo' : 'módulos'}
      </p>

      <ul className={styles.grid}>
        {visibleModules.map(({ id, title, summary, categoryId, icon: Icon }) => {
          const category = moduleCategories.find(({ id: categoryKey }) => categoryKey === categoryId)

          return (
            <li className={styles.card} data-tone={category?.tone} id={id} key={id}>
              <span className={styles.icon}><Icon aria-hidden="true" size={21} /></span>
              <span className={styles.category}>{category?.label}</span>
              <h2>{title}</h2>
              <p>{summary}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
