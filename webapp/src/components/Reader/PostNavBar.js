import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { grey } from '@material-ui/core/colors';

const PostNav = ({ target, children }) => {
  return (
    <Nav
      disabled={!target}
      onClick={e => !target && e.preventDefault()}
      to={`/post/${target}`}
    >
      {children}
    </Nav>
  );
};

export const PostNavBar = ({ post }) => {
  return (
    <Wrapper>
      <PostNav target={post.prevId}>
        <>
          <ChevronLeft />
          {'Prev'}
        </>
      </PostNav>
      <Nav to="/">Library</Nav>
      <PostNav target={post.nextId}>
        <>
          {'Next'}
          <ChevronRight />
        </>
      </PostNav>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  height: 48px;
  justify-content: space-between;
  align-items: center;
`;

const Nav = styled(Link)`
  && {
    text-decoration: none;
    :hover {
      text-decoration: ${props => (props.disabled ? 'none' : 'underline')};
    }
    user-select: none;
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    font-size: 1.2em;
    display: flex;
    align-items: center;
    color: ${props => (props.disabled ? grey[400] : grey[800])};
  }
`;
