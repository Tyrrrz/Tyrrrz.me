import React from 'react'
import Helmet from 'react-helmet'

export const Meta = ({ title, description }) => {
  title =
    title === null || title === undefined
      ? `Alexey Golub`
      : `${title} | Alexey Golub`

  description = description || `Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker`

  return (
    <Helmet
      htmlAttributes={{ lang: `en` }}
      title={title}
      meta={[
        {
          name: `description`,
          content: description,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: description,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: `@Tyrrrz`,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: description,
        },
      ]}
    />
  )
}
