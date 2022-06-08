import Link from "next/link";
import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";

import { Categories, Category, DocScope } from "../../utils/docs";
import ThemeToggleButton from "../ThemeToggleButton";
import Button from "../Button";
import Logo from "../Icons/Logo";
import Hamburger from "../Icons/Hamburger";
import Discord from "../Icons/Discord";

/**
 * Creates an array of categories, nested each sub pages under their parent
 */
const createNestedTOC = (categories: Categories) => {
  const sortedCategories = Object.values(categories).sort(
    (a, b) => a.order - b.order
  );
  return sortedCategories.map((category) => {
    const pages = [];
    category.pages.forEach((page) => {
      const basePath = page.slug.split("/").slice(0, -1).join("/");
      const parentPage = pages.find((p) => p.slug === basePath);
      if (parentPage) {
        parentPage.pages.push(page);
      } else {
        pages.push({ pages: [], ...page });
      }
    });
    return {
      title: category.title,
      order: category.order,
      pages,
    };
  });
};

const DocsNav: React.FC<{ cli: Categories, cloud: Categories }> = ({ cli, cloud }) => {
  const [isExpanded, setExpanded] = useState(false);
  const nestedCLI = createNestedTOC(cli);
  const nestedCloud = createNestedTOC(cloud);

console.log(nestedCloud, cloud);

  return (
    <Sidebar>
      <div className="sidebar-header">
        <a href="/">
          <Logo width={115} />
        </a>
        <a
          href="#"
          className="mobile-nav-toggle"
          onClick={() => setExpanded(!isExpanded)}
        >
          <Hamburger size="24" />
        </a>
      </div>
      <Menu isExpanded={isExpanded}>
        <Nav>
          <NavList>
            {nestedCLI.map((c, idx) => (
              <DocsNavItem key={`cat-${idx}`} category={c} type="cli" />
            ))}

            <hr />

            <h5>Cloud docs</h5>

            {nestedCloud.map((c, idx) => (
              <DocsNavItem key={`cat-${idx}`} category={c} type="cloud" />
            ))}

          </NavList>
          <div>
            <ThemeToggleButton />
          </div>
        </Nav>
        <CTAContainer>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Discord size="16px" /> Join our Discord
          </a>
          <div className="auth-ctas">
            <Button
              href={`${process.env.NEXT_PUBLIC_SIGNUP_URL}?ref=docs-nav`}
              size="small"
              kind="primary"
              style={{ padding: "0.4em 0.9em" }}
            >
              Sign up for free
            </Button>
            <a className="auth-login" href={process.env.NEXT_PUBLIC_LOGIN_URL}>
              Log in
            </a>
          </div>
        </CTAContainer>
      </Menu>
    </Sidebar>
  );
};

export default DocsNav;

const DocsNavItem: React.FC<{ category: Category; doc?: DocScope, type: "cli" | "cloud" }> = ({
  category,
  doc,
  type,
}) => {
  const [isExpanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathSlug = router.asPath.replace(/^\/docs\//, "");

  const title = doc ? doc.title : category.title;
  const pages = doc ? doc.pages : category.pages;
  const isCurrentPage = pathSlug === doc?.slug && type === doc.type;

  const shouldExpand =
    isCurrentPage ||
    !!(pages || []).find((p) => {
      return pathSlug.indexOf(p.slug) === 0 && p.type === type;
    });

  useEffect(() => {
    if (shouldExpand) {
      setExpanded(true);
    }
  }, [shouldExpand]);

  const formattedTitle = title.replace(/`(.+)`/, "<code>$1</code>");

  if (!doc && category && category.title === "") {
  // If there's no category title, render the pages outright in the menu.
    return !!pages?.length && (
        <NavList className="items" isExpanded={true} style={{ margin: 0 }}>
          {pages
            .sort((a, b) => a.order - b.order)
            .map((d) => (
              <DocsNavItem
                key={`sub-cat-${d.slug}`}
                category={category}
                doc={d}
                type={type}
              />
            ))}
        </NavList>
      )
  }

  return (
    <NavItem key={title} isCurrentPage={isCurrentPage}>
      {doc && doc.reading?.words > 0 ? (
        <Link href={`/docs/${doc.slug}`}>
          <a
            className="docs-page"
            dangerouslySetInnerHTML={{
              __html: formattedTitle,
            }}
          ></a>
        </Link>
      ) : (
        <span
          className="docs-category"
          onClick={() => setExpanded(!isExpanded)}
          dangerouslySetInnerHTML={{
            __html: formattedTitle,
          }}
        ></span>
      )}

      {!!pages?.length && (
        <NavList className="items" isExpanded={isExpanded}>
          {pages
            .sort((a, b) => a.order - b.order)
            .map((d) => (
              <DocsNavItem
                key={`sub-cat-${d.slug}`}
                category={category}
                doc={d}
                type={type}
              />
            ))}
        </NavList>
      )}
    </NavItem>
  );
};

const Sidebar = styled.div`
  --sidebar-padding: 2em;

  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0px;
  height: 100vh;
  overflow: scroll;
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-color);

  .sidebar-header {
    padding: var(--sidebar-padding);
    display: flex;
    justify-content: space-between;
  }
  .mobile-nav-toggle {
    display: none;
    color: var(--font-color-primary);
  }
  .align-bottom {
    position: absolute;
    bottom: 1em;
    right: 1em;
  }

  // Drop the parent display grid so the content goes to 100%
  @media (max-width: 800px) {
    position: fixed;
    width: 100%;
    max-height: 100vh; // to enable scrolling for large menus
    height: auto;
    z-index: 1;
    border-right: none;
    border-bottom: 1px solid var(--border-color);

    .sidebar-header {
      padding: calc(0.5 * var(--sidebar-padding)) var(--sidebar-padding);
    }

    .brand-logo svg {
      position: relative;
      top: 6px; // vertically center b/c of the g
      left: -6px; // horizontally center b/c of svg viewbox
      height: 30px;
    }

    .mobile-nav-toggle {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 34px;
      width: 34px;
    }
  }
`;

const Menu = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  @media (max-width: 800px) {
    margin-top: 1em;
    display: ${({ isExpanded }) => (isExpanded ? "block" : "none")};
    overflow: scroll;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  padding: 0 var(--sidebar-padding) var(--sidebar-padding);
`;

const NavList = styled.ul<{ isExpanded?: boolean }>`
  display: ${({ isExpanded }) => (isExpanded ? "block" : "none")};
  padding: 0;
  list-style: none;
  font-size: 1em;

  a {
    text-decoration: none;
    color: var(--font-color-primary);
  }
  .active {
    color: var(--color-iris-60);
  }

  ul {
    margin: 0 0 0 1em;
  }

  .docs-category {
    cursor: pointer;
  }

  @media (max-width: 800px) {
    font-size: 16px;
  }

  hr {
    background: transparent;
    border: 0 none;
    border-bottom: 1px solid var(--border-color);
    margin: 2rem 0 1.5rem;
  }

  h5 {
    font-size: .6rem;
  }
`;
NavList.defaultProps = {
  isExpanded: true,
};

const NavItem = styled.li<{ isCurrentPage?: boolean }>`
  margin: 1em 0;
  list-style: none;
  font-size: 1em;

  // Only highlight the direct child
  > .docs-page {
    color: ${({ isCurrentPage }) =>
      isCurrentPage ? "var(--color-iris-60)" : ""};
  }
`;

const CTAContainer = styled.div`
  display: grid;
  padding: var(--sidebar-padding);
  grid-row-gap: 1em;
  border-top: 1px solid var(--border-color);

  .auth-ctas {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  a {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  a > svg {
    margin-right: 10px;
  }
`;
