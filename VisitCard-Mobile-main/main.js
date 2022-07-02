const LinksSocialMedia = {
  github: 'milin22',
  youtube: 'channel/UC3OXwS64hiaXi-r-U-qXCWw',
  facebook: 'yuppie0',
  instagram: 'lia.chamchi',
}
function changeSocialMediaLinks() {
  for (let li of socialLinks.children) {
    const social = li.getAttribute('class')

    li.children[0].href = `http://${social}.com/${LinksSocialMedia[social]}`
  }
}
changeSocialMediaLinks()


