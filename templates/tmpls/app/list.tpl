{{#feeds}}
  <li class="{{cls}}" id="feed-{{id}}">
    <a href="#{{href}}">
      <span class="indicator"></span>
      <span class="title">{{title}}</span>
      {{#author}}
        <span class="author">{{author}}</span>
      {{/author}}
      <ul class="tags">
        {{#tags}}
          <li>{{.}}</li>
        {{/tags}}
      </ul>
      <span class="vote">
        <span class="up"></span>
        <span class="down"></span>
      </span>
      <span class="date">{{ date }}</span>
    </a>
  </li>
{{/feeds}}